export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        <a href="/" className="h-9 w-9 rounded-lg bg-primary-500 text-white grid place-items-center font-bold shadow-sm">S</a>
      </div>
      {children}
    </div>
  );
}
