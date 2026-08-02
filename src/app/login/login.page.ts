import { Component } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonCard, IonItem, IonInput, IonButton } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { chatbubblesOutline, mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, arrowForwardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonButton, IonInput, IonItem, IonCard, IonIcon, IonContent, FormsModule],
})
export class LoginPage {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    addIcons({
      chatbubblesOutline,
      mailOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      arrowForwardOutline
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onLogin() {
    if (!this.email || !this.password) {
      this.showAlert('Atención', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent'
    });
    await loading.present();

    // Mandamos el objeto exacto que espera tu backend ({ email, pass })
    this.authService.login({ email: this.email, pass: this.password }).subscribe({
      next: async (res: any) => {
        await loading.dismiss();
        
        // Guardamos el usuario devuelto por tu @Post('login') de NestJS
        localStorage.setItem('user', JSON.stringify(res.user || res));

        const toast = await this.toastController.create({
          message: `¡Bienvenido!`,
          duration: 2000,
          color: 'success',
          position: 'top'
        });
        await toast.present();

        this.router.navigateByUrl('/dashboard', { replaceUrl: true });
      },
      error: async (err) => {
        await loading.dismiss();
        console.error(err);
        this.showAlert('Acceso Denegado', 'Correo o contraseña incorrectos.');
      },
    });
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}