import React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

// The `cn` utility function is a helper for conditionally joining class names.
// It's a common pattern in Tailwind/Radix projects.
const cn = (...classes: (string | undefined | null | false | 0)[]) => {
  return classes.filter(Boolean).join(" ");
};

// --- Dropdown Menu Components (Updated for Dark Theme) ---

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  );
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  );
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          // Existing classes for animation, positioning, and base styling.
          "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-[--radix-dropdown-menu-content-available-height] min-w-[8rem] origin-[var(--radix-dropdown-menu-content-transform-origin)] overflow-x-hidden overflow-y-auto rounded-md border border-zinc-200 dark:border-zinc-700 p-1 shadow-md",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        // The `dark:` prefix ensures these styles apply only when the parent has the `dark` class.
        // We're replacing the generic color classes with theme-aware ones.
        "focus:bg-zinc-100 dark:focus:bg-zinc-700 focus:text-zinc-900 dark:focus:text-zinc-50 data-[variant=destructive]:text-red-500 data-[variant=destructive]:focus:bg-red-500/10 dark:data-[variant=destructive]:focus:bg-red-500/20 data-[variant=destructive]:focus:text-red-500 dark:data-[variant=destructive]:focus:text-red-400 data-[variant=destructive]:*:!text-red-500 dark:data-[variant=destructive]:*:!text-red-400 [&_svg:not([class*='text-'])]:text-zinc-500 dark:[&_svg:not([class*='text-'])]:text-zinc-400 relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-zinc-100 dark:focus:bg-zinc-700 focus:text-zinc-900 dark:focus:text-zinc-50 relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-zinc-100 dark:focus:bg-zinc-700 focus:text-zinc-900 dark:focus:text-zinc-50 relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        // Adding theme-aware text color for the label
        "px-2 py-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-50 data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn(
        // The separator needs to change color in dark mode for visibility.
        "bg-zinc-200 dark:bg-zinc-700 -mx-1 my-1 h-px",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        // Adjusting text color for dark mode.
        "text-zinc-500 dark:text-zinc-400 ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-zinc-100 dark:focus:bg-zinc-700 focus:text-zinc-900 dark:focus:text-zinc-50 data-[state=open]:bg-zinc-100 dark:data-[state=open]:bg-zinc-700 data-[state=open]:text-zinc-900 dark:data-[state=open]:text-zinc-50 flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[inset]:pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        // The submenu content also needs dark mode colors.
        "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-[var(--radix-dropdown-menu-content-transform-origin)] overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700 p-1 shadow-lg",
        className
      )}
      {...props}
    />
  );
}

// Export the components
export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};

// // Main App component to demonstrate the dropdown menu
// function App() {
//   const [theme, setTheme] = useState("light");
//   const [radioValue, setRadioValue] = useState("new");

//   useEffect(() => {
//     // Add or remove the 'dark' class on the document element based on the theme state.
//     const root = window.document.documentElement;
//     root.classList.remove(theme === "dark" ? "light" : "dark");
//     root.classList.add(theme);
//   }, [theme]);

//   const toggleTheme = () => {
//     setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-zinc-900 p-8 transition-colors duration-300">
//       <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">
//         Dropdown Menu with Dark Mode
//       </h1>
//       <DropdownMenu>
//         <DropdownMenuTrigger asChild>
//           <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-900 bg-zinc-100 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:bg-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-600 transition-colors">
//             Open Menu
//           </button>
//         </DropdownMenuTrigger>
//         <DropdownMenuContent className="w-56">
//           <DropdownMenuLabel>My Account</DropdownMenuLabel>
//           <DropdownMenuSeparator />
//           <DropdownMenuGroup>
//             <DropdownMenuItem>
//               Profile
//               <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
//             </DropdownMenuItem>
//             <DropdownMenuItem>
//               Billing
//               <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
//             </DropdownMenuItem>
//             <DropdownMenuItem>
//               Settings
//               <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
//             </DropdownMenuItem>
//           </DropdownMenuGroup>
//           <DropdownMenuSeparator />
//           <DropdownMenuSub>
//             <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
//             <DropdownMenuSubContent>
//               <DropdownMenuItem>Email</DropdownMenuItem>
//               <DropdownMenuItem>Message</DropdownMenuItem>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem>More...</DropdownMenuItem>
//             </DropdownMenuSubContent>
//           </DropdownMenuSub>
//           <DropdownMenuSeparator />
//           <DropdownMenuCheckboxItem checked>
//             Show Sidebar
//           </DropdownMenuCheckboxItem>
//           <DropdownMenuSeparator />
//           <DropdownMenuRadioGroup value={radioValue} onValueChange={setRadioValue}>
//             <DropdownMenuLabel>Sort by</DropdownMenuLabel>
//             <DropdownMenuRadioItem value="new">Newest</DropdownMenuRadioItem>
//             <DropdownMenuRadioItem value="old">Oldest</DropdownMenuRadioItem>
//           </DropdownMenuRadioGroup>
//           <DropdownMenuSeparator />
//           <DropdownMenuItem variant="destructive">Log out</DropdownMenuItem>
//         </DropdownMenuContent>
//       </DropdownMenu>

//       <button
//         onClick={toggleTheme}
//         className="fixed bottom-4 right-4 p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors"
//         aria-label="Toggle theme"
//       >
//         {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
//       </button>
//     </div>
//   );
// }

// export default App;