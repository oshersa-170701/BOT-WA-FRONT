import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
  IonContent, IonIcon, IonGrid, IonRow, IonCol, IonCard, 
  IonFab, IonFabButton, ModalController 
} from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { chatbubblesOutline, logOutOutline, cubeOutline, optionsOutline, chevronForwardOutline, personOutline, documentTextOutline, peopleOutline } from 'ionicons/icons';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
    IonContent, IonIcon, IonGrid, IonRow, IonCol, IonCard,
    IonFab, IonFabButton
  ],
})
export class DashboardPage implements OnInit {
  currentUser: any = { name: 'Usuario', email: 'correo@empresa.com' };

  constructor(private router: Router, private modalController: ModalController) {
    addIcons({logOutOutline,chatbubblesOutline,cubeOutline,chevronForwardOutline,optionsOutline,documentTextOutline,peopleOutline,personOutline});
  }

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        this.currentUser = JSON.parse(userJson);
      } catch (e) {
      }
    }
  }

  async openProfileModal() {
    const modal = await this.modalController.create({
      component: ProfileComponent,
      componentProps: { user: this.currentUser },
      cssClass: 'profile-modal-custom',
      mode: 'ios',
      breakpoints: [0, 0.5, 0.8],
      initialBreakpoint: 0.5
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data === 'logout') {
      this.logout();
    }
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}