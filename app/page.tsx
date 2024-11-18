import { SecurityRegion } from '@/components/security-region';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          IEEE 9 Bus System Security Region
        </h1>
        <SecurityRegion />
      </div>
    </main>
  );
}