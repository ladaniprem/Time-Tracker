// import * as React from "react"
// import { Slot } from "@radix-ui/react-slot"
// import { cva, type VariantProps } from "class-variance-authority"

// import { cn } from "@/lib/utils"

// const buttonVariants = cva(
//   "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
//   {
//     variants: {
//       variant: {
//         default:
//           "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
//         destructive:
//           "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
//         outline:
//           "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input",
//         secondary:
//           "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
//         ghost:
//           "hover:bg-accent hover:text-accent-foreground",
//         link: "text-primary underline-offset-4 hover:underline",
//       },
//       size: {
//         default: "h-9 px-4 py-2 has-[>svg]:px-3",
//         sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
//         lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
//         icon: "size-9",
//       },
//     },
//     defaultVariants: {
//       variant: "default",
//       size: "default",
//     },
//   }
// )

// function Button({
//   className,
//   variant,
//   size,
//   asChild = false,
//   ...props
// }: React.ComponentProps<"button"> &
//   VariantProps<typeof buttonVariants> & {
//     asChild?: boolean
//   }) {
//   const Comp = asChild ? Slot : "button"

//   return (
//     <Comp
//       data-slot="button"
//       className={cn(buttonVariants({ variant, size, className }))}
//       {...props}
//     />
//   )
// }

// export { Button }

import * as React from "react"
// Slot is a component from Radix UI. Since we can't import it directly,
// we'll create a simplified mock component that simply renders its children.
const Slot = ({ children }: { children: React.ReactNode }) => {
  if (React.isValidElement(children)) {
    return children;
  }
  return null;
};

// This is a simplified version of `cva` from 'class-variance-authority'
// to make the code runnable. It does not include the full logic,
// but it is enough to prevent the 'cva is not defined' error.
const cva = (base: string, { variants, defaultVariants }: { 
  variants: {
    variant?: Record<string, string>;
    size?: Record<string, string>;
  };
  defaultVariants: {
    variant?: string;
    size?: string;
  };
}) => {
  return ({ variant, size, className }: { variant?: string; size?: string; className?: string }) => {
    // A simplified way to combine classes.
    const baseClasses = base;
    // Fix: Correctly access the variant and size properties from the `variants` object
    const variantClasses = variant && variants.variant ? variants.variant[variant] : (defaultVariants.variant && variants.variant ? variants.variant[defaultVariants.variant] : '');
    const sizeClasses = size && variants.size ? variants.size[size] : (defaultVariants.size && variants.size ? variants.size[defaultVariants.size] : '');

    return `${baseClasses} ${variantClasses} ${sizeClasses} ${className || ""}`.trim();
  };
};

// This is a placeholder for your `cn` utility function.
// In a real project, this would likely use `clsx` or a similar library.
const cn = (...classNames: (string | undefined)[]) => classNames.filter(Boolean).join(" ");

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  asChild = false,
  size = "default",
  ...props
}: {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  asChild?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
} & React.ComponentPropsWithoutRef<"button">) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
// In a real project, this would likely be: export { Button, buttonVariants }
export { Button }

// The App component to demonstrate the buttons.
// function App() {
//   return (
//     <div className="p-8 space-y-4">
//       <h1 className="text-3xl font-bold text-center">Button Component Showcase</h1>
//       <div className="flex flex-wrap items-center justify-center gap-4">
//         <Button variant="default" className="">Default</Button>
//         <Button variant="secondary">Secondary</Button>
//         <Button variant="outline">Outline</Button>
//         <Button variant="destructive">Destructive</Button>
//         <Button variant="ghost">Ghost</Button>
//         <Button variant="link">Link</Button>
//       </div>
//       <div className="flex flex-wrap items-center justify-center gap-4">
//         <Button size="sm">Small Button</Button>
//         <Button size="default">Default Button</Button>
//         <Button size="lg">Large Button</Button>
//         <Button size="icon">
//           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 0-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.78 1.36a2 2 0 0 0 .73 2.73l.15.08a2 2 0 0 1 1 1.73v.55a2 2 0 0 1-1 1.73l-.15.08a2 2 0 0 0-.73 2.73l.78 1.36a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 0 2-0l.15.08a2 2 0 0 0 2.73-.73l.78-1.36a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.73v-.55a2 2 0 0 1 1-1.73l.15-.08a2 2 0 0 0 .73-2.73l-.78-1.36a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
//         </Button>
//       </div>
//     </div>
//   );
// }

// // Ensure the main component is exported as the default.
// export default App;
