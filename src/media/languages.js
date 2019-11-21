import { AsyncStorage } from "react-native";

let options = [
  {
    name: "english",
    errors: {
      error: "Error",
      emailEmpty: "Please fill in the email field.",
      emailInvalid: "Invalid email. Please try again.",
      passEmpty: "Please fill in the password field.",
      passInvalid: "Password must have at least 1 number, 1 symbol, and 8 letters.",
      nameEmpty: "Please fill in the name field.",
      nameInvalid: "Name must not contain numbers or symbols.",
      heightEmpty: "Please fill in the height field.",
      heightInvalid: "Invalid height. Please try again.",
      weightEmpty: "Please fill in the weight field.",
      weightInvalid: "Invalid weight. Please try again.",
      userNotFound: "No user corresponds to those credentials.",
      networkError: "Network error. Please try again.",
      unhandledError: "An unhandled error has occured: \n\n",
      googlePlayServicesMissing: "Fatal Error: cannot sign in. Please update Google Play Services",
      imageNetworkError: "Network error while uploading image.",
      imageUnhandledError: "An unhandled error while uploading image has occured: \n\n",
      facebookResetPassError: "Error: unable to reset password. Facebook users can not reset their password with Sportsmart."
    },
    labels: {
      error: "Error",
      registerText: "Don't have an account?",
      resetPassText: "Forgot your password?",
      storagePermissionTitle: "Sportsmart requires your storage permission",
      storagePermissionText: "Sportsmart needs access to your storage in order to set your profile image.",
      locationPermissionTitle: "Sportsmart requires your location permission",
      locationPermissionText: "Sportsmart needs access to your location in order to track your walking distance.",
      resetPassScreenText: "Please enter your registered Email to reset your password.",
      together: "Together",
      activity: "Activity",
      statistics: "Statistics",
      settings: "Settings",
      support: "Support",
      running: "Running",
      notifiers: "Notifiers",
      profile: "Profile",
      metric: "Metric",
      imperial: "Imperial",
      email: "Email",
      password: "Password",
      name: "Name",
      bio: "Description (optional)",
      height: "Height",
      weight: "Weight",
      login: "Login",
      register: "Register",
      resetPass: "Reset Password",
      signOut: "Sign Out"
    }
  },
  {
    name: "hrvatski",
    errors: {
      error: "Greška",
      emailEmpty: "Molimo vas da ispunite polje za email.",
      emailInvalid: "Nevažeći email. Molimo vas pokušajte ponovo.",
      passEmpty: "Molimo vas da ispunite polje za lozinku.",
      passInvalid: "Password mora imati jedan broj, jedan simbol, i najmanje 8 slova.",
      nameEmpty: "Molimo vas da ispunite ime.",
      nameInvalid: "Ime ne smije sadržavati simbole ili brojeve.",
      heightEmpty: "Molimo vas da ispunite polje za visinu.",
      heightInvalid: "Nevažeća visina. Molimo vas pokušajte ponovo.",
      weightEmpty: "Molimo vas da ispunite polje za težinu.",
      weightInvalid: "Nevažeća težina. Molimo vas pokušajte ponovo.",
      userNotFound: "Taj korisnik ne postoji.",
      networkError: "Pogreška sa mrežom, molimo vas pokušajte ponovo.",
      unhandledError: "Nepoznata pogreška: \n\n",
      googlePlayServicesMissing: "Pogreška u prijavi. Molimo vas ažurirajte Google Play Services",
      imageNetworkError: "Pogreška sa mrežom tijekom učitavanje slike.",
      imageUnhandledError: "Nepoznata pogreška tijekom učitavanje slike: \n\n",
      facebookResetPassError: "Pogreška u mijenjanju lozinke: Facebook korisnici ne mogu promijeniti lozinku pomoću Sportsmarta"
    },
    labels: {
      error: "Greška",
      registerText: "Nemate račun?",
      resetPassText: "Zaboravili ste lozinku?",
      storagePermissionTitle: "Sportsmart zahtijeva pristup unutarnjoj pohrani vašeg uređaja.",
      storagePermissionText: "Sportsmartu treba pristup unutarnjoj pohrani vašeg uređaja da biste postavili profilnu sliku.",
      locationPermissionTitle: "Sportsmart zahtijeva pristup vašoj lokaciji.",
      locationPermissionText: "Sportsmartu treba pristup vašoj lokaciji da biste mogli pratiti korake i udaljenost.",
      resetPassScreenText: "Molimo vas da unesete vaš prijavljeni Email da biste promjenili lozinku.",
      together: "Zajedno",
      activity: "Aktivnost",
      statistics: "Statistike",
      settings: "Postavke",
      support: "Podrška",
      running: "Trening",
      notifiers: "Obavijesti",
      profile: "Profil",
      email: "Email",
      password: "Lozinka",
      name: "Ime",
      bio: "Opis (neobavezno)",
      height: "Visina",
      weight: "Težina",
      login: "Prijava",
      register: "Registriraj se",
      resetPass: "Promjeni lozinku",
      signOut: "Odjavi se"
    }
  }
];

let defaultLang = options[0];
let currentLang = defaultLang;

module.exports = {
  defaultLang: defaultLang,
  currentLang: currentLang,
  options: options
}