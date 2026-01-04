import { cn } from '@/lib/utils';
import * as Slot from '@rn-primitives/slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Platform, Text as RNText, type Role } from 'react-native';

const textVariants = cva(
  cn(
    'text-base text-foreground font-sans',
    Platform.select({
      web: 'select-text',
    })
  ),
  {
    variants: {
      variant: {
        default: '',
        // Display - Large hero text
        display: cn(
          'text-[32px] leading-[40px] tracking-[-0.02em] font-mono-bold',
          Platform.select({ web: 'scroll-m-20' })
        ),
        // Heading hierarchy
        h1: cn(
          'text-[24px] leading-[32px] tracking-[-0.01em] font-sans-bold',
          Platform.select({ web: 'scroll-m-20' })
        ),
        h2: cn(
          'text-[20px] leading-[28px] tracking-[-0.01em] font-sans-semibold',
          Platform.select({ web: 'scroll-m-20' })
        ),
        h3: cn(
          'text-[16px] leading-[24px] font-sans-semibold',
          Platform.select({ web: 'scroll-m-20' })
        ),
        h4: cn(
          'text-[14px] leading-[20px] font-sans-semibold',
          Platform.select({ web: 'scroll-m-20' })
        ),
        // Body text
        body: 'text-[14px] leading-[22px] font-sans',
        // Caption / small text
        caption: 'text-[12px] leading-[16px] tracking-[0.01em] font-sans',
        // Monospace for data/numbers
        mono: 'text-[14px] leading-[20px] font-mono',
        'mono-lg': 'text-[20px] leading-[28px] font-mono-semibold',
        'mono-xl': 'text-[24px] leading-[32px] font-mono-bold',
        'mono-2xl': 'text-[32px] leading-[40px] font-mono-bold',
        // Legacy variants
        p: 'mt-3 leading-7 font-sans sm:mt-6',
        blockquote: 'mt-4 border-l-2 pl-3 italic font-sans sm:mt-6 sm:pl-6',
        code: cn(
          'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm'
        ),
        lead: 'text-xl text-muted-foreground font-sans',
        large: 'text-lg font-sans-semibold',
        small: 'text-sm font-sans-medium leading-none',
        muted: 'text-sm text-muted-foreground font-sans',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type TextVariantProps = VariantProps<typeof textVariants>;

type TextVariant = NonNullable<TextVariantProps['variant']>;

const ROLE: Partial<Record<TextVariant, Role>> = {
  h1: 'heading',
  h2: 'heading',
  h3: 'heading',
  h4: 'heading',
  display: 'heading',
  blockquote: Platform.select({ web: 'blockquote' as Role }),
  code: Platform.select({ web: 'code' as Role }),
};

const ARIA_LEVEL: Partial<Record<TextVariant, string>> = {
  display: '1',
  h1: '1',
  h2: '2',
  h3: '3',
  h4: '4',
};

const TextClassContext = React.createContext<string | undefined>(undefined);

function Text({
  className,
  asChild = false,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof RNText> &
  TextVariantProps &
  React.RefAttributes<RNText> & {
    asChild?: boolean;
  }) {
  const textClass = React.useContext(TextClassContext);
  const Component = asChild ? Slot.Text : RNText;
  return (
    <Component
      className={cn(textVariants({ variant }), textClass, className)}
      role={variant ? ROLE[variant] : undefined}
      aria-level={variant ? ARIA_LEVEL[variant] : undefined}
      {...props}
    />
  );
}

export { Text, TextClassContext };
