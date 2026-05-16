export const metadata = {
  title: 'Welcome to BabyNest - Complete Your Setup',
  description: 'Let\'s personalize your experience',
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream-50">
      {children}
    </div>
  );
}
