import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
  IonIcon, IonSearchbar, IonFab, IonFabButton, IonAlert, ToastController, LoadingController, ModalController 
} from '@ionic/angular/standalone';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { arrowBackOutline, addOutline, createOutline, trashOutline, cubeOutline } from 'ionicons/icons';
import { ProductModalComponent } from './product-modal/product-modal.component';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, HttpClientModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
    IonIcon, IonSearchbar, IonFab, IonFabButton, IonAlert
  ]
})
export class ProductsPage implements OnInit {
  apiUrl = 'http://localhost:3000/products';
  products: any[] = [];
  filteredProducts: any[] = [];
  searchTerm: string = '';
  
  isAlertOpen = false;
  productToDelete: any = null;
  alertButtons = [
    { text: 'Cancelar', role: 'cancel', handler: () => { this.productToDelete = null; } },
    { text: 'Eliminar', role: 'destructive', handler: () => { this.deleteProductConfirmed(); } }
  ];

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private modalController: ModalController // <-- Inyección correcta aquí
  ) {
    addIcons({ arrowBackOutline, addOutline, createOutline, trashOutline, cubeOutline });
  }

  ngOnInit() {
    this.loadProducts();
  }

  async loadProducts() {
    const loading = await this.loadingController.create({ message: 'Cargando productos...', spinner: 'crescent' });
    await loading.present();

    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = data;
        loading.dismiss();
      },
      error: (err) => {
        loading.dismiss();
        this.showToast('Aun no se cuenta con productos registrados', 'danger');
      }
    });
  }

  filterProducts() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(p => 
        p.name.toLowerCase().includes(term) || 
        (p.brand && p.brand.toLowerCase().includes(term)) ||
        (p.sku && p.sku.toLowerCase().includes(term))
      );
    }
  }

  async openAddModal() {
    const modal = await this.modalController.create({
      component: ProductModalComponent,
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.http.post(this.apiUrl, data).subscribe({
        next: () => {
          this.showToast('Producto creado exitosamente 🚀', 'success');
          this.loadProducts();
        },
        error: (err) => {
         
          this.showToast('Error al crear el producto', 'danger');
        }
      });
    }
  }

  async openEditModal(product: any) {
    const modal = await this.modalController.create({
      component: ProductModalComponent,
      componentProps: { product }
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.http.patch(`${this.apiUrl}/${product.id}`, data).subscribe({
        next: () => {
          this.showToast('Producto actualizado correctamente', 'success');
          this.loadProducts();
        },
        error: (err) => {
         
          this.showToast('Error al actualizar el producto', 'danger');
        }
      });
    }
  }

  confirmDelete(product: any) {
    this.productToDelete = product;
    this.isAlertOpen = true;
  }

  deleteProductConfirmed() {
    if (!this.productToDelete) return;

    this.http.delete(`${this.apiUrl}/${this.productToDelete.id}`).subscribe({
      next: async () => {
        this.showToast('Producto eliminado exitosamente', 'success');
        this.loadProducts();
        this.productToDelete = null;
      },
      error: (err) => {
        this.showToast('No se pudo eliminar el producto', 'danger');
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