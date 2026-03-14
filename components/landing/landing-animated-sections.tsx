"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14
    }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
};

export function LandingAnimatedSections() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-10">
      <motion.section variants={item} className="glass-card rounded-3xl p-8 md:p-12">
        <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/90">Population Health Management</p>
        <h1 className="mt-3 text-4xl font-semibold md:text-6xl">VitalSync</h1>
        <p className="mt-4 max-w-2xl text-base text-slate-300 md:text-lg">
          Premium command center for chronic care coordination across diabetes, hypertension, and COPD populations.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/analytics">Open MVP Dashboard</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/patients">Register Patient</Link>
          </Button>
        </div>
      </motion.section>

      <motion.section variants={item} className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Care Plans</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">Track protocol adherence and measurable outcomes.</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Medication + Visits</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">Coordinate refill reminders with scheduled follow-ups.</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Risk + Analytics</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">Identify high-risk cohorts and close care gaps faster.</CardContent>
        </Card>
      </motion.section>
    </motion.div>
  );
}
