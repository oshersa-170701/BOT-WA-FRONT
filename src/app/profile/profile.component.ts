import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonContent, IonButton, IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, mailOutline, logOutOutline, callOutline } from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonButton, IonIcon]
})
export class ProfileComponent  {

@Input() user: any = {};

  constructor(private modalController: ModalController) {
    addIcons({closeOutline,mailOutline,callOutline,logOutOutline});
  }

  dismiss() {
    this.modalController.dismiss();
  }

  logout() {
    this.modalController.dismiss('logout');
  }
}