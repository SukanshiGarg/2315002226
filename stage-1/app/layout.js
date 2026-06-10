import './globals.css';

export const metadata = {
  title: 'Campus Notifications - Priority Inbox',
  description: 'Priority Inbox for Campus Notifications',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
