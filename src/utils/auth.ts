export const isAdmin = (email: string) => {
    const adminEmails = ['davveravve@gmail.com']; // Lägg till din email här
    return adminEmails.includes(email);
  };