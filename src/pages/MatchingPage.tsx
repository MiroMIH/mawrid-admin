import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { matchingSimulationSchema, type MatchingSimulationFormData } from '../schemas/matching.schema';
import { useSimulateMatching } from '../hooks/useStats';
import { useCategoryTree } from '../hooks/useCategories';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import type { Category } from '../types';
import { GitBranch, FlaskConical, Users, CheckCircle } from 'lucide-react';

const WILAYAS = [
  '01 - Adrar', '02 - Chlef', '03 - Laghouat', '04 - Oum El Bouaghi',
  '05 - Batna', '06 - Béjaïa', '07 - Biskra', '08 - Béchar',
  '09 - Blida', '10 - Bouira', '11 - Tamanrasset', '12 - Tébessa',
  '13 - Tlemcen', '14 - Tiaret', '15 - Tizi Ouzou', '16 - Alger',
  '17 - Djelfa', '18 - Jijel', '19 - Sétif', '20 - Saïda',
  '21 - Skikda', '22 - Sidi Bel Abbès', '23 - Annaba', '24 - Guelma',
  '25 - Constantine', '26 - Médéa', '27 - Mostaganem', '28 - M\'Sila',
  '29 - Mascara', '30 - Ouargla', '31 - Oran', '32 - El Bayadh',
  '33 - Illizi', '34 - Bordj Bou Arréridj', '35 - Boumerdès', '36 - El Tarf',
  '37 - Tindouf', '38 - Tissemsilt', '39 - El Oued', '40 - Khenchela',
  '41 - Souk Ahras', '42 - Tipaza', '43 - Mila', '44 - Aïn Defla',
  '45 - Naâma', '46 - Aïn Témouchent', '47 - Ghardaïa', '48 - Relizane',
  '49 - El M\'Ghair', '50 - El Meniaa', '51 - Ouled Djellal',
  '52 - Bordj Badji Mokhtar', '53 - Béni Abbès', '54 - Timimoun',
  '55 - Touggourt', '56 - Djanet', '57 - In Salah', '58 - In Guezzam',
];

interface SimResult {
  [key: string]: unknown;
}

export function MatchingPage() {
  const { data: tree } = useCategoryTree();
  const simulate = useSimulateMatching();
  const { showToast } = useToast();
  const [result, setResult] = useState<SimResult | null>(null);

  const flattenTree = (cats: Category[], result: Category[] = []): Category[] => {
    for (const cat of cats) {
      if (cat.nodeType === 'LEAF') result.push(cat);
      if (cat.children) flattenTree(cat.children, result);
    }
    return result;
  };
  const leafCategories = flattenTree(tree ?? []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MatchingSimulationFormData>({
    resolver: zodResolver(matchingSimulationSchema),
    defaultValues: {
      wilaya: '16',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      quantity: 100,
    },
  });

  const onSubmit = async (data: MatchingSimulationFormData) => {
    try {
      const res = await simulate.mutateAsync(data);
      setResult(res as SimResult);
      showToast('Simulation completed');
    } catch (e: unknown) {
      showToast((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Simulation failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Matching Simulation</h1>
        <p className="text-sm text-gray-500 mt-1">Simulate supplier matching for a demande before it goes live.</p>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: GitBranch,
            title: 'How it works',
            text: 'The engine matches suppliers subscribed to the selected category and wilaya.',
          },
          {
            icon: Users,
            title: 'Supplier scoring',
            text: 'Suppliers are ranked by category match, wilaya proximity, and availability.',
          },
          {
            icon: CheckCircle,
            title: 'Use cases',
            text: 'Test before going live, validate wilaya coverage, and fine-tune category trees.',
          },
        ].map(({ icon: Icon, title, text }) => (
          <Card key={title}>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#FFC107]/10 rounded-lg">
                <Icon className="w-5 h-5 text-[#FFC107]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{title}</p>
                <p className="text-xs text-gray-500 mt-1">{text}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulation form */}
        <Card>
          <CardHeader title="Simulation Parameters" description="Fill in the demande criteria" />
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Category (Leaf only)</label>
              <select
                {...register('categoryId', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
              >
                <option value="">Select a leaf category…</option>
                {leafCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-xs text-red-600">{errors.categoryId.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Wilaya</label>
              <select
                {...register('wilaya')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
              >
                {WILAYAS.map((w) => {
                  const code = w.split(' - ')[0].trim();
                  return <option key={code} value={code}>{w}</option>;
                })}
              </select>
              {errors.wilaya && <p className="text-xs text-red-600">{errors.wilaya.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  {...register('quantity', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                  min={1}
                />
                {errors.quantity && <p className="text-xs text-red-600">{errors.quantity.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Deadline</label>
                <input
                  type="date"
                  {...register('deadline')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                />
                {errors.deadline && <p className="text-xs text-red-600">{errors.deadline.message}</p>}
              </div>
            </div>

            <Button
              type="submit"
              loading={simulate.isPending}
              className="w-full justify-center"
              icon={<FlaskConical className="w-4 h-4" />}
            >
              Run Simulation
            </Button>
          </form>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader title="Simulation Result" description="Matched suppliers and scoring" />
          {simulate.isPending ? (
            <div className="py-12 flex items-center justify-center gap-3 text-gray-400">
              <div className="w-5 h-5 border-2 border-[#FFC107] border-t-transparent rounded-full animate-spin" />
              Running simulation…
            </div>
          ) : result ? (
            <div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Simulation completed successfully
                </p>
              </div>
              <pre className="bg-gray-50 rounded-lg p-4 text-xs text-gray-700 overflow-auto max-h-80">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="py-16 text-center text-gray-400">
              <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Run a simulation to see matched suppliers</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
