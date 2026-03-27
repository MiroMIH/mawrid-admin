import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { matchingSimulationSchema, type MatchingSimulationFormData } from '../schemas/matching.schema';
import { useSimulateMatching } from '../hooks/useStats';
import { useCategoryTree } from '../hooks/useCategories';
import { useToast } from '../components/ui/Toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { Category } from '../types';
import {
  GitBranch, FlaskConical, Users, CheckCircle2,
  Loader2, MapPin, Package, Calendar, Tag,
  Zap, AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.35, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

/* ── Algeria wilayas ── */
const WILAYAS = [
  '01 - Adrar','02 - Chlef','03 - Laghouat','04 - Oum El Bouaghi',
  '05 - Batna','06 - Béjaïa','07 - Biskra','08 - Béchar',
  '09 - Blida','10 - Bouira','11 - Tamanrasset','12 - Tébessa',
  '13 - Tlemcen','14 - Tiaret','15 - Tizi Ouzou','16 - Alger',
  '17 - Djelfa','18 - Jijel','19 - Sétif','20 - Saïda',
  '21 - Skikda','22 - Sidi Bel Abbès','23 - Annaba','24 - Guelma',
  '25 - Constantine','26 - Médéa','27 - Mostaganem','28 - M\'Sila',
  '29 - Mascara','30 - Ouargla','31 - Oran','32 - El Bayadh',
  '33 - Illizi','34 - Bordj Bou Arréridj','35 - Boumerdès','36 - El Tarf',
  '37 - Tindouf','38 - Tissemsilt','39 - El Oued','40 - Khenchela',
  '41 - Souk Ahras','42 - Tipaza','43 - Mila','44 - Aïn Defla',
  '45 - Naâma','46 - Aïn Témouchent','47 - Ghardaïa','48 - Relizane',
  '49 - El M\'Ghair','50 - El Meniaa','51 - Ouled Djellal',
  '52 - Bordj Badji Mokhtar','53 - Béni Abbès','54 - Timimoun',
  '55 - Touggourt','56 - Djanet','57 - In Salah','58 - In Guezzam',
];

const infoCards = [
  {
    icon: GitBranch,
    title: 'How it works',
    text: 'The engine matches suppliers subscribed to the selected category and wilaya.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Users,
    title: 'Supplier scoring',
    text: 'Suppliers are ranked by category match, wilaya proximity, and availability.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    icon: CheckCircle2,
    title: 'Use cases',
    text: 'Test before going live, validate wilaya coverage, fine-tune category trees.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
];

function flattenLeafs(cats: Category[], out: Category[] = []): Category[] {
  for (const cat of cats) {
    if (cat.nodeType === 'LEAF') out.push(cat);
    if (cat.children) flattenLeafs(cat.children, out);
  }
  return out;
}

interface SimResult { [key: string]: unknown }

/* ── Field wrapper ── */
function Field({
  label, icon: Icon, error, children,
}: { label: string; icon: React.ElementType; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-destructive flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const selectClass = `w-full px-3 py-2 rounded-lg border border-border bg-background text-sm
  text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
  transition-all appearance-none cursor-pointer`;

const inputClass = `w-full px-3 py-2 rounded-lg border border-border bg-background text-sm
  text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
  transition-all`;

/* ─────────────────────────────── */
export function MatchingPage() {
  const { data: tree } = useCategoryTree();
  const simulate = useSimulateMatching();
  const { showToast } = useToast();
  const [result, setResult] = useState<SimResult | null>(null);

  const leafCategories = flattenLeafs(tree ?? []);

  const { register, handleSubmit, formState: { errors } } = useForm<MatchingSimulationFormData>({
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
      showToast('Simulation completed successfully');
    } catch (e: unknown) {
      showToast(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Simulation failed',
        'error',
      );
    }
  };

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={stagger}>

      {/* Header */}
      <motion.div variants={fadeUp} custom={0} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Matching Simulation</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Simulate supplier matching for a demande before it goes live.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FFC107]/10 border border-[#FFC107]/30 rounded-full">
          <Zap className="w-3.5 h-3.5 text-[#FFC107]" />
          <span className="text-xs font-semibold text-[#111111]">Engine Active</span>
        </div>
      </motion.div>

      {/* Info cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {infoCards.map(({ icon: Icon, title, text, color, bg }, i) => (
          <motion.div
            key={title}
            variants={fadeUp}
            custom={i}
            whileHover={{ y: -2, transition: { duration: 0.18 } }}
          >
            <Card className="border-border/60 h-full">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl ${bg} shrink-0`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{text}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main area */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Form */}
        <motion.div variants={fadeUp} custom={3}>
          <Card className="border-border/60 h-full">
            <CardHeader className="pb-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#FFC107]/10">
                  <FlaskConical className="w-4 h-4 text-[#FFC107]" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">Simulation Parameters</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Configure the demande criteria to simulate
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <Separator className="mt-4 mb-0" />

            <CardContent className="pt-5">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                <Field label="Category" icon={Tag} error={errors.categoryId?.message}>
                  {!tree ? (
                    <Skeleton className="h-9 w-full rounded-lg" />
                  ) : (
                    <select
                      {...register('categoryId', { valueAsNumber: true })}
                      className={selectClass}
                    >
                      <option value="">Select a leaf category…</option>
                      {leafCategories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  )}
                </Field>

                <Field label="Wilaya" icon={MapPin} error={errors.wilaya?.message}>
                  <select {...register('wilaya')} className={selectClass}>
                    {WILAYAS.map((w) => {
                      const code = w.split(' - ')[0].trim();
                      return <option key={code} value={code}>{w}</option>;
                    })}
                  </select>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Quantity" icon={Package} error={errors.quantity?.message}>
                    <input
                      type="number"
                      {...register('quantity', { valueAsNumber: true })}
                      className={inputClass}
                      min={1}
                    />
                  </Field>

                  <Field label="Deadline" icon={Calendar} error={errors.deadline?.message}>
                    <input
                      type="date"
                      {...register('deadline')}
                      className={inputClass}
                    />
                  </Field>
                </div>

                <motion.div whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.01 }}>
                  <Button
                    type="submit"
                    disabled={simulate.isPending}
                    className="w-full bg-[#FFC107] text-[#111111] hover:bg-[#e6ac00] font-semibold gap-2"
                  >
                    {simulate.isPending
                      ? <><Loader2 className="w-4 h-4 animate-spin" />Running…</>
                      : <><FlaskConical className="w-4 h-4" />Run Simulation</>
                    }
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        <motion.div variants={fadeUp} custom={4}>
          <Card className="border-border/60 h-full">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <GitBranch className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">Simulation Result</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Matched suppliers and scoring output
                    </CardDescription>
                  </div>
                </div>
                {result && (
                  <Badge variant="secondary" className="text-xs">
                    Completed
                  </Badge>
                )}
              </div>
            </CardHeader>

            <Separator className="mt-4 mb-0" />

            <CardContent className="pt-5">
              <AnimatePresence mode="wait">
                {simulate.isPending ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-12 flex flex-col items-center justify-center gap-4"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-2 border-[#FFC107]/20" />
                      <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-[#FFC107] border-t-transparent animate-spin" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">Running simulation…</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Matching suppliers to criteria</p>
                    </div>
                    <div className="w-full space-y-2 mt-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-4/5" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </motion.div>
                ) : result ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <p className="text-sm font-medium text-emerald-800">
                        Simulation completed successfully
                      </p>
                    </div>
                    <div className="rounded-lg border border-border overflow-hidden">
                      <div className="bg-muted px-4 py-2 border-b border-border flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Raw Output
                        </span>
                        <span className="text-xs text-muted-foreground">JSON</span>
                      </div>
                      <pre className="p-4 text-xs text-foreground overflow-auto max-h-72 leading-relaxed">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="py-16 flex flex-col items-center justify-center text-center gap-3"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                        <FlaskConical className="w-7 h-7 text-muted-foreground/40" />
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FFC107]/30 flex items-center justify-center"
                      >
                        <div className="w-2 h-2 rounded-full bg-[#FFC107]" />
                      </motion.div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Ready to simulate</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Configure parameters on the left and run the simulation
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
