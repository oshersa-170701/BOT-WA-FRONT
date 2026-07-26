import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
  IonContent, IonItem, IonInput, IonTextarea, ModalController, IonRow, IonCol 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-product-modal',
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.scss'],
  standalone: true,
  imports: [
    IonCol, IonRow, 
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
    IonContent, IonItem, IonInput, IonTextarea
  ]
})
export class ProductModalComponent implements OnInit {
  @Input() product: any = null;

  formData = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    unit: 'pza',
    brand: '',
    sku: '',
    image_url: '' // Campo añadido para la URL de la imagen
  };

  isEditing = false;

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    if (this.product) {
      this.isEditing = true;
      this.formData = { ...this.product };
    }
  }

  dismiss(data: any = null) {
    this.modalController.dismiss(data);
  }

  save() {
    if (!this.formData.name || this.formData.price <= 0) {
      alert('Por favor ingresa un nombre y un precio válido.');
      return;
    }
    this.dismiss(this.formData);
  }
}