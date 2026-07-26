import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
  IonIcon, IonCard, IonItem, IonInput, IonTextarea, IonSelect, IonSelectOption, ToastController, IonSpinner, IonToggle } from '@ionic/angular/standalone';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { arrowBackOutline, saveOutline, keyOutline, settingsOutline, trashOutline, addOutline, qrCodeOutline, refreshOutline, logOutOutline } from 'ionicons/icons';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [IonToggle, 
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
    allowed_days: [1, 2, 3, 4, 5] // Por defecto Lunes a Viernes
  };

  keywords: any[] = [];
  
 newKeyword = {
    keyword: '',
    match_type: 'contains', // <-- Asegurar tipo por defecto
    response_type: 'product_search',
    reply_text: '',
    is_active: true
  };

  qrCodeImage: string | null = null;
  botStatus: string = 'Desconectado';
  isLoadingQr: boolean = false;
  isDisconnecting: boolean = false;
  
  // Nuevos estados de carga para mejorar la experiencia de usuario
  isLoadingSettings: boolean = false;
  isLoadingKeyword: boolean = false;

  constructor(
    private http: HttpClient,
    private toastController: ToastController
  ) {
    addIcons({arrowBackOutline,settingsOutline,saveOutline,qrCodeOutline,refreshOutline,logOutOutline,keyOutline,addOutline,trashOutline});
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

  addKeyword() {
    if (!this.newKeyword.keyword) {
      this.showToast('Escribe una palabra clave', 'warning');
      return;
    }

    this.isLoadingKeyword = true;
    this.http.post(`${this.keywordsApi}/${this.whatsappPhone}`, this.newKeyword).subscribe({
      next: () => {
        this.isLoadingKeyword = false;
        this.showToast('Palabra clave agregada', 'success');
        this.newKeyword.keyword = '';
        this.newKeyword.reply_text = '';
        this.loadKeywords();
      },
      error: () => {
        this.isLoadingKeyword = false;
        this.showToast('Error al agregar la palabra clave (puede que ya exista)', 'danger');
      }
    });
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

    // Función interna de reintento automático (Polling)
    const fetchQrWithRetry = (attempts = 0) => {
      this.http.get<any>(`${this.whatsappApi}/qr/${this.whatsappPhone}`).subscribe({
        next: (res) => {
          if (res && res.qr) {
            // ¡Éxito! Ya se generó el QR
            this.isLoadingQr = false;
            this.qrCodeImage = res.qr;
            this.botStatus = 'Escanea el código QR con tu WhatsApp';
          } else if (attempts < 6) {
            // Si el backend sigue procesando, reintentamos automáticamente en 2 segundos
            this.botStatus = `Generando código QR (Intento ${attempts + 1}/6)...`;
            setTimeout(() => fetchQrWithRetry(attempts + 1), 2000);
          } else {
            // Si pasan los intentos y no responde
            this.isLoadingQr = false;
            this.botStatus = 'El servidor tardó demasiado. Intenta de nuevo.';
            this.showToast('Tiempo de espera agotado al generar el QR', 'warning');
          }
        },
        error: () => {
          if (attempts < 4) {
            // Si da error de red temporal mientras arranca el navegador, reintentamos
            setTimeout(() => fetchQrWithRetry(attempts + 1), 2500);
          } else {
            this.isLoadingQr = false;
            this.botStatus = 'Error al conectar con WhatsApp';
            this.showToast('No se pudo obtener el código QR del servidor', 'danger');
          }
        }
      });
    };

    // Disparamos el primer intento
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
      color,
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