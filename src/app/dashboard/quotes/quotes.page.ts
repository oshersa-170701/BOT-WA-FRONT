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
import { arrowBackOutline, trashOutline, documentTextOutline } from 'ionicons/icons';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-quotes',
  templateUrl: './quotes.page.html',
  styleUrls: ['./quotes.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, HttpClientModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
    IonIcon, IonAlert
  ]
})
export class QuotesPage implements OnInit {
  apiUrl = `${environment.apiUrl}/quotes`;
  quotes: any[] = [];
  whatsappPhone: string = '';
  
  isAlertOpen = false;
  quoteToDeleteId: number | null = null;
  alertButtons = [
    { text: 'Cancelar', role: 'cancel', handler: () => { this.quoteToDeleteId = null; } },
    { text: 'Eliminar', role: 'destructive', handler: () => { this.deleteQuoteConfirmed(); } }
  ];

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ arrowBackOutline, trashOutline, documentTextOutline });
  }

  ngOnInit() {
    const loggedUser = localStorage.getItem('user');
    if (loggedUser) {
      const userObj = JSON.parse(loggedUser);
      this.whatsappPhone = userObj.whatsapp_phone || '';
    }
    this.loadQuotes();
  }

  async loadQuotes() {
    const loading = await this.loadingController.create({ message: 'Cargando cotizaciones...', spinner: 'crescent' });
    await loading.present();

    const url = this.whatsappPhone ? `${this.apiUrl}/user/${this.whatsappPhone}` : this.apiUrl;

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.quotes = data;
        loading.dismiss();
      },
      error: () => {
        loading.dismiss();
        this.showToast('No se pudieron cargar las cotizaciones', 'danger');
      }
    });
  }

  confirmDelete(id: number) {
    this.quoteToDeleteId = id;
    this.isAlertOpen = true;
  }

  deleteQuoteConfirmed() {
    if (!this.quoteToDeleteId) return;

    this.http.delete(`${this.apiUrl}/${this.quoteToDeleteId}`).subscribe({
      next: () => {
        this.showToast('Cotización eliminada exitosamente', 'success');
        this.loadQuotes();
        this.quoteToDeleteId = null;
      },
      error: () => {
        this.showToast('Error al eliminar la cotización', 'danger');
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