import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
  IonIcon, IonSearchbar, IonFab, IonFabButton, IonAlert, ToastController, LoadingController, ModalController, 
  AlertController
} from '@ionic/angular/standalone';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { arrowBackOutline, addOutline, createOutline, trashOutline, cubeOutline, cloudUploadOutline } from 'ionicons/icons';
import { ProductModalComponent } from './product-modal/product-modal.component';
import { environment } from 'src/environments/environment.prod';

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
  apiUrl = `${environment.apiUrl}/products`;
  products: any[] = [];
  filteredProducts: any[] = [];
  searchTerm: string = '';
  whatsappPhone: string = ''; 
  
  // Variables de paginación
  currentPage: number = 1;
  pageSize: number = 10; 
  totalPages: number = 1;
  paginatedProducts: any[] = [];
  
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
    private modalController: ModalController,
    private alertController: AlertController
  ) {
    addIcons({ arrowBackOutline, addOutline, createOutline, trashOutline, cubeOutline, cloudUploadOutline });
  }

  ngOnInit() {
    const loggedUser = localStorage.getItem('user');
    if (loggedUser) {
      const userObj = JSON.parse(loggedUser);
      this.whatsappPhone = userObj.whatsapp_phone || ''; 
    }

    this.loadProducts();
  }

  async loadProducts() {
    const loading = await this.loadingController.create({ message: 'Cargando productos...', spinner: 'crescent' });
    await loading.present();

    const url = this.whatsappPhone ? `${this.apiUrl}/user/${this.whatsappPhone}` : this.apiUrl;

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.products = data || [];
        this.filteredProducts = this.products;
        
        // Actualizamos el paginador y la vista de inmediato
        this.filterProducts(); 

        loading.dismiss();
      },
      error: (err) => {
        loading.dismiss();
        this.products = [];
        this.filteredProducts = [];
        this.paginatedProducts = [];
        this.showToast('Aun no se cuenta con productos registrados', 'danger');
      }
    });
  }

  async openAddModal() {
    const modal = await this.modalController.create({
      component: ProductModalComponent,
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      const loading = await this.loadingController.create({ message: 'Guardando producto...', spinner: 'crescent' });
      await loading.present();

      this.http.post(`${this.apiUrl}/${this.whatsappPhone || '9516493519'}`, data).subscribe({
        next: () => {
          loading.dismiss();
          this.showToast('Producto creado exitosamente', 'success');
          this.searchTerm = ''; // Limpiamos la barra de búsqueda para ver el nuevo registro al inicio/fin
          this.loadProducts();  // Refresco automático de la tabla
        },
        error: (err) => {
          loading.dismiss();
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
      const loading = await this.loadingController.create({ message: 'Actualizando producto...', spinner: 'crescent' });
      await loading.present();

      this.http.patch(`${this.apiUrl}/${product.id}`, data).subscribe({
        next: () => {
          loading.dismiss();
          this.showToast('Producto actualizado correctamente', 'success');
          this.loadProducts(); // Refresco automático de la tabla reflejando los cambios
        },
        error: (err) => {
          loading.dismiss();
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

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    if (!this.whatsappPhone) {
      this.showToast('No se encontró el teléfono del bot vinculado', 'warning');
      event.target.value = '';
      return;
    }

    const alert = await this.alertController.create({
      header: '¿Confirmar carga masiva?',
      message: `Estás a punto de importar el archivo "${file.name}". Esto agregará o actualizará los productos en tu catálogo. ¿Deseas continuar?`,
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            event.target.value = ''; 
          }
        },
        {
          text: 'Sí, importar',
          handler: async () => {
            const loading = await this.loadingController.create({ 
              message: 'Importando productos desde Excel...', 
              spinner: 'crescent' 
            });
            await loading.present();

            const formData = new FormData();
            formData.append('file', file);

            this.http.post<any>(`${this.apiUrl}/upload-excel/${this.whatsappPhone}`, formData).subscribe({
              next: (res) => {
                loading.dismiss();
                if (res && res.success) {
                  this.showToast(res.message, 'success');
                  this.searchTerm = ''; // Limpiamos la barra de búsqueda para reflejar todo el catálogo nuevo
                  this.loadProducts();  // Refresco automático inmediato de la tabla y paginador
                } else {
                  this.showToast(res.message || 'Error al importar archivo', 'danger');
                }
                event.target.value = ''; 
              },
              error: () => {
                loading.dismiss();
                this.showToast('Error de conexión al subir el Excel', 'danger');
                event.target.value = '';
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  filterProducts() {
    const term = this.searchTerm ? this.searchTerm.toLowerCase().trim() : '';
    let result = this.products;

    if (term) {
      result = this.products.filter(p => 
        (p.name && p.name.toLowerCase().includes(term)) || 
        (p.brand && p.brand.toLowerCase().includes(term)) ||
        (p.sku && p.sku.toLowerCase().includes(term))
      );
    }

    this.totalPages = Math.ceil(result.length / this.pageSize) || 1;
    if (this.currentPage > this.totalPages) this.currentPage = 1;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.paginatedProducts = result.slice(startIndex, startIndex + this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.filterProducts();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.filterProducts();
    }
  }
}