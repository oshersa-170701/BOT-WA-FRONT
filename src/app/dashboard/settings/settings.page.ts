import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
  IonIcon, IonCard, IonItem, IonInput, IonTextarea, IonSelect, IonSelectOption, ToastController, IonSpinner, IonToggle, IonNote } from '@ionic/angular/standalone';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { arrowBackOutline, saveOutline, keyOutline, settingsOutline, trashOutline, addOutline, qrCodeOutline, refreshOutline, logOutOutline, timeOutline, shieldCheckmarkOutline, createOutline, closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [IonNote, IonToggle, 
    IonSpinner, CommonModule, FormsModule, RouterLink, HttpClientModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
    IonIcon, IonCard, IonItem, IonInput, IonTextarea, IonSelect, IonSelectOption
  ]
})
export class SettingsPage implements OnInit {
  settingsApi = 'http://localhost:3000/bot-settings';
  keywordsApi = 'http://localhost:3000/bot-keywords';
  whatsappApi = 'http://localhost:3000/whatsapp';

  whatsappPhone: string = '';

  botSetting = {
    bot_name: 'Bot Asistente',
    welcome_message: '',
    fallback_message: '',
    is_bot_active: true,
    start_time: '08:00',
    end_time: '18:00',
    allowed_days: [1, 2, 3, 4, 5]
  };

  keywords: any[] = [];
  
  newKeyword = {
    keyword: '',
    match_type: 'contains',
    response_type: 'product_search',
    reply_text: '',
    is_active: true
  };

  // Estado para controlar la edición
  editingKeywordId: number | null = null;

  qrCodeImage: string | null = null;
  botStatus: string = 'Desconectado';
  isLoadingQr: boolean = false;
  isDisconnecting: boolean = false;
  
  isLoadingSettings: boolean = false;
  isLoadingKeyword: boolean = false;

  constructor(
    private http: HttpClient,
    private toastController: ToastController
  ) {
    addIcons({arrowBackOutline,settingsOutline,saveOutline,qrCodeOutline,timeOutline,shieldCheckmarkOutline,refreshOutline,logOutOutline,keyOutline,addOutline,trashOutline,createOutline,closeOutline});
  }

  ngOnInit() {
    const loggedUser = localStorage.getItem('user');
    if (loggedUser) {
      const userObj = JSON.parse(loggedUser);
      this.whatsappPhone = userObj.whatsapp_phone || ''; 
    }

    if (this.whatsappPhone) {
      this.loadSettings();
      this.loadKeywords();
    } else {
      this.showToast('No se encontró un número de WhatsApp vinculado a este usuario', 'warning');
    }
  }

  loadSettings() {
    this.http.get<any>(`${this.settingsApi}/${this.whatsappPhone}`).subscribe({
      next: (data) => {
        if (data) this.botSetting = data;
      },
    });
  }

  loadKeywords() {
    this.http.get<any[]>(`${this.keywordsApi}/user/${this.whatsappPhone}`).subscribe({
      next: (data) => {
        this.keywords = data;
      },
    });
  }

  saveSettings() {
    this.isLoadingSettings = true;
    this.http.patch(`${this.settingsApi}/${this.whatsappPhone}`, this.botSetting).subscribe({
      next: () => {
        this.isLoadingSettings = false;
        this.showToast('Configuración del bot guardada exitosamente', 'success');
      },
      error: () => {
        this.http.post(`${this.settingsApi}/${this.whatsappPhone}`, this.botSetting).subscribe({
          next: () => {
            this.isLoadingSettings = false;
            this.showToast('Configuración creada exitosamente', 'success');
          },
          error: () => {
            this.isLoadingSettings = false;
            this.showToast('Error al guardar la configuración', 'danger');
          }
        });
      }
    });
  }

  // Método unificado para Crear o Actualizar regla
  saveKeyword() {
    if (!this.newKeyword.keyword) {
      this.showToast('Escribe una palabra clave', 'warning');
      return;
    }

    this.isLoadingKeyword = true;

    if (this.editingKeywordId) {
      // Modo Edición (PATCH)
      this.http.patch(`${this.keywordsApi}/${this.editingKeywordId}`, this.newKeyword).subscribe({
        next: () => {
          this.isLoadingKeyword = false;
          this.showToast('Palabra clave actualizada con éxito', 'success');
          this.resetKeywordForm();
          this.loadKeywords();
        },
        error: () => {
          this.isLoadingKeyword = false;
          this.showToast('Error al actualizar la palabra clave', 'danger');
        }
      });
    } else {
      // Modo Creación (POST)
      this.http.post(`${this.keywordsApi}/${this.whatsappPhone}`, this.newKeyword).subscribe({
        next: () => {
          this.isLoadingKeyword = false;
          this.showToast('Palabra clave agregada', 'success');
          this.resetKeywordForm();
          this.loadKeywords();
        },
        error: () => {
          this.isLoadingKeyword = false;
          this.showToast('Error al agregar la palabra clave (puede que ya exista)', 'danger');
        }
      });
    }
  }

  // Cargar datos en el formulario superior para editar
  editKeyword(k: any) {
    this.editingKeywordId = k.id;
    this.newKeyword = {
      keyword: k.keyword,
      match_type: k.match_type,
      response_type: k.response_type,
      reply_text: k.reply_text || '',
      is_active: k.is_active
    };
    // Desplazarse suavemente al formulario o dar aviso visual opcional
  }

  // Cancelar la edición activa
  cancelEdit() {
    this.resetKeywordForm();
    this.showToast('Edición cancelada', 'danger');
  }

  resetKeywordForm() {
    this.editingKeywordId = null;
    this.newKeyword = {
      keyword: '',
      match_type: 'contains',
      response_type: 'product_search',
      reply_text: '',
      is_active: true
    };
  }

  deleteKeyword(id: number) {
    this.http.delete(`${this.keywordsApi}/${id}`).subscribe({
      next: () => {
        this.showToast('Palabra clave eliminada', 'success');
        this.loadKeywords();
      },
      error: () => this.showToast('Error al eliminar', 'danger')
    });
  }

  generateWhatsAppQR() {
    this.isLoadingQr = true;
    this.botStatus = 'Iniciando conexión con WhatsApp...';

    const fetchQrWithRetry = (attempts = 0) => {
      this.http.get<any>(`${this.whatsappApi}/qr/${this.whatsappPhone}`).subscribe({
        next: (res) => {
          if (res && res.qr) {
            this.isLoadingQr = false;
            this.qrCodeImage = res.qr;
            this.botStatus = 'Escanea el código QR con tu WhatsApp';
          } else if (attempts < 6) {
            this.botStatus = `Verificando estado (Intento ${attempts + 1}/6)...`;
            setTimeout(() => fetchQrWithRetry(attempts + 1), 2500);
          } else {
            this.isLoadingQr = false;
            this.botStatus = 'Sesión activa detectada';
            this.showToast('⚠️ El número ya cuenta con una sesión previa. Por favor haz clic en "Desconectar / Cerrar Sesión" e inténtalo de nuevo.', 'danger');
          }
        },
        error: () => {
          if (attempts < 4) {
            setTimeout(() => fetchQrWithRetry(attempts + 1), 2500);
          } else {
            this.isLoadingQr = false;
            this.botStatus = 'Error al conectar con WhatsApp';
            this.showToast('⚠️ Desconecta el número de WhatsApp antes de generar un nuevo código QR.', 'danger');
          }
        }
      });
    };

    fetchQrWithRetry();
  }

  disconnectWhatsApp() {
    this.isDisconnecting = true;
    this.botStatus = 'Cerrando sesión y limpiando sistema...';

    this.http.post(`${this.whatsappApi}/disconnect/${this.whatsappPhone}`, {}).subscribe({
      next: () => {
        this.isDisconnecting = false;
        this.qrCodeImage = null;
        this.botStatus = 'Desconectado / Haz clic en Conectar';
        this.showToast('Sesión de WhatsApp cerrada correctamente', 'success');
      },
      error: () => {
        this.isDisconnecting = false;
        this.qrCodeImage = null;
        this.botStatus = 'Desconectado / Haz clic en Conectar';
        this.showToast('Sesión reiniciada con éxito', 'success');
      }
    });
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      color ,
      position: 'top'
    });
    await toast.present();
  }

  toggleDay(dayValue: number) {
    if (!this.botSetting.allowed_days) {
      this.botSetting.allowed_days = [];
    }
    const index = this.botSetting.allowed_days.indexOf(dayValue);
    if (index > -1) {
      this.botSetting.allowed_days.splice(index, 1);
    } else {
      this.botSetting.allowed_days.push(dayValue);
    }
  }

  isDaySelected(dayValue: number): boolean {
    return this.botSetting.allowed_days && this.botSetting.allowed_days.includes(dayValue);
  }
}