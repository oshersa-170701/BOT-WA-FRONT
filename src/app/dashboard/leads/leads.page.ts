import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
  IonIcon, IonAlert, ToastController, LoadingController 
} from '@ionic/angular/standalone';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { arrowBackOutline, trashOutline, peopleOutline } from 'ionicons/icons';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-leads',
  templateUrl: './leads.page.html',
  styleUrls: ['./leads.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, HttpClientModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
    IonIcon, IonAlert
  ]
})
export class LeadsPage implements OnInit {
  apiUrl = `${environment.apiUrl}/leads`;
  leads: any[] = [];
  whatsappPhone: string = '';
  
  isAlertOpen = false;
  leadToDeleteId: number | null = null;
  alertButtons = [
    { text: 'Cancelar', role: 'cancel', handler: () => { this.leadToDeleteId = null; } },
    { text: 'Eliminar', role: 'destructive', handler: () => { this.deleteLeadConfirmed(); } }
  ];

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ arrowBackOutline, trashOutline, peopleOutline });
  }

  ngOnInit() {
    const loggedUser = localStorage.getItem('user');
    if (loggedUser) {
      const userObj = JSON.parse(loggedUser);
      this.whatsappPhone = userObj.whatsapp_phone || '';
    }
    this.loadLeads();
  }

  async loadLeads() {
    const loading = await this.loadingController.create({ message: 'Cargando leads y asesores...', spinner: 'crescent' });
    await loading.present();

    const url = this.whatsappPhone ? `${this.apiUrl}/user/${this.whatsappPhone}` : this.apiUrl;

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.leads = data;
        loading.dismiss();
      },
      error: () => {
        loading.dismiss();
        this.showToast('No se pudieron cargar los leads', 'danger');
      }
    });
  }

  confirmDelete(id: number) {
    this.leadToDeleteId = id;
    this.isAlertOpen = true;
  }

  deleteLeadConfirmed() {
    if (!this.leadToDeleteId) return;

    this.http.delete(`${this.apiUrl}/${this.leadToDeleteId}`).subscribe({
      next: () => {
        this.showToast('Lead eliminado exitosamente', 'success');
        this.loadLeads();
        this.leadToDeleteId = null;
      },
      error: () => {
        this.showToast('Error al eliminar el lead', 'danger');
      }
    });
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      color,
      position: 'top'
    });
    await toast.present();
  }
}