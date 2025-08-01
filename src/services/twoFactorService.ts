import { auth } from '../lib/firebase';
import { sendEmailVerification, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

export interface TwoFactorCode {
  code: string;
  email: string;
  createdAt: Date;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
}

class TwoFactorService {
  private static instance: TwoFactorService;
  private codes: Map<string, TwoFactorCode> = new Map();

  private constructor() {}

  static getInstance(): TwoFactorService {
    if (!TwoFactorService.instance) {
      TwoFactorService.instance = new TwoFactorService();
    }
    return TwoFactorService.instance;
  }

  /**
   * Generiert einen 6-stelligen Code für 2FA
   */
  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Erstellt einen neuen 2FA Code für einen Benutzer
   */
  createCode(email: string): TwoFactorCode {
    const code = this.generateCode();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 Minuten

    const twoFactorCode: TwoFactorCode = {
      code,
      email,
      createdAt: now,
      expiresAt,
      attempts: 0,
      maxAttempts: 3
    };

    this.codes.set(email, twoFactorCode);
    
    // Cleanup nach 10 Minuten
    setTimeout(() => {
      this.codes.delete(email);
    }, 10 * 60 * 1000);

    return twoFactorCode;
  }

  /**
   * Validiert einen 2FA Code
   */
  validateCode(email: string, inputCode: string): { valid: boolean; message: string } {
    const storedCode = this.codes.get(email);
    
    if (!storedCode) {
      return { valid: false, message: 'Kein gültiger Code gefunden. Bitte fordern Sie einen neuen Code an.' };
    }

    if (new Date() > storedCode.expiresAt) {
      this.codes.delete(email);
      return { valid: false, message: 'Der Code ist abgelaufen. Bitte fordern Sie einen neuen Code an.' };
    }

    if (storedCode.attempts >= storedCode.maxAttempts) {
      this.codes.delete(email);
      return { valid: false, message: 'Zu viele fehlgeschlagene Versuche. Bitte fordern Sie einen neuen Code an.' };
    }

    storedCode.attempts++;

    if (storedCode.code !== inputCode) {
      const remainingAttempts = storedCode.maxAttempts - storedCode.attempts;
      return { 
        valid: false, 
        message: `Falscher Code. Noch ${remainingAttempts} Versuche übrig.` 
      };
    }

    // Code ist korrekt - entferne ihn aus dem Speicher
    this.codes.delete(email);
    return { valid: true, message: 'Code erfolgreich validiert.' };
  }

  /**
   * Sendet einen 2FA Code per E-Mail
   */
  async sendCodeEmail(email: string, code: string): Promise<{ success: boolean; message: string }> {
    try {
      // Hier würden Sie normalerweise einen E-Mail-Service wie SendGrid, AWS SES, etc. verwenden
      // Für Demo-Zwecke simulieren wir das Senden
      console.log(`2FA Code ${code} wurde an ${email} gesendet`);
      
      // In der Produktion würden Sie hier den tatsächlichen E-Mail-Versand implementieren
      // await emailService.send({
      //   to: email,
      //   subject: 'Ihr Sicherheitscode für das MATHI HOFFER Kundenportal',
      //   template: 'two-factor-auth',
      //   data: { code }
      // });

      return { success: true, message: 'Code erfolgreich gesendet.' };
    } catch (error) {
      console.error('Fehler beim Senden des 2FA Codes:', error);
      return { success: false, message: 'Fehler beim Senden des Codes. Bitte versuchen Sie es erneut.' };
    }
  }

  /**
   * Prüft, ob ein Code für eine E-Mail existiert
   */
  hasCode(email: string): boolean {
    return this.codes.has(email);
  }

  /**
   * Entfernt einen Code (z.B. bei Logout)
   */
  removeCode(email: string): void {
    this.codes.delete(email);
  }
}

export default TwoFactorService.getInstance(); 