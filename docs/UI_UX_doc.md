UI/UX Documentation: Mpiloshini RMH 24 (Neumorphic)
Version: 1.2
Date: 2025-08-10

1. Overview
This document provides UI and UX guidelines for the Mpiloshini RMH 24 application. It specifies a Neumorphic design language to create a soft, tactile, and intuitive user interface, and provides implementation context for a React (Vite) + TypeScript frontend with a Supabase backend.

2. User Personas
Primary Persona: Reliability Engineer (Alex)

Goal: To proactively identify machine health issues across the plant and prevent unplanned downtime.

Needs: Detailed diagnostic plots, historical data trends, and reliable alerts presented in a clean, uncluttered interface.

Secondary Persona: Maintenance Technician (Maria)

Goal: To quickly diagnose a specific machine that is behaving abnormally.

Needs: A simple upload process, clear "Go/No-Go" results, and actionable maintenance recommendations with obvious, pressable buttons.

3. User Flow
Login: User interacts with soft, inset input fields. Authentication is handled by supabase.auth.signInWithPassword(). The session is managed client-side.

Dashboard: User lands on a dashboard composed of extruded panels (cards) that appear to push out from the background. Data is fetched from the Supabase database using supabase-js.

Upload Data: The user drags a file into a concave, inset dropzone. The file is uploaded directly to Supabase Storage from the browser. On success, the file path is sent to the backend API to trigger the diagnosis.

View Diagnostics: Results are displayed on extruded cards. The severity is communicated through subtle color shifts and clear icons. The frontend polls the backend or uses a real-time subscription to know when results are ready.

Analyze Plots: Data visualizations are presented within inset panels, making them feel like they are recessed into the dashboard for focus.

Download Report: The user presses a soft, extruded button that appears to sink into the surface when clicked. The report is generated client-side using a library like jspdf.

4. Visual Design & Style Guide (Neumorphic)
4.1. Core Principle: Soft Realism
The UI will avoid traditional "flat" design elements. Instead, every component will look like it's made from the same material as the background, extruded or pressed into the surface. This is achieved through the precise use of shadows.

4.2. Color Palette
The palette is strictly monochromatic to emphasize the shape and depth created by shadows.

Role

Color Name

Hex Code

Usage

Background

Soft Light Gray

#e0e0e0

The universal background color for the entire application.

Light Shadow

White-ish

#ffffff

Used for the top-left shadow to create a "light source" effect.

Dark Shadow

Gray-ish

#bebebe

Used for the bottom-right shadow to create depth.

Accent (Subtle)

Muted Blue

#5a7d9a

Used sparingly for icons and critical text to draw attention without breaking the monochromatic feel.

Text

Dark Gray

#313131

Primary color for all text to ensure readability.

4.3. Shadows & Borders
No Borders: Elements will not have traditional border properties.

Implementation (Tailwind CSS): Custom shadow styles will be defined in tailwind.config.js or applied using arbitrary values.

Extruded: shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]

Inset: shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]

4.4. Typography
Primary Font: Inter

Headings: font-semibold, color #313131

Body Text: font-normal, color #555555

4.5. Iconography
Library: Lucide Icons (lucide-react)

Style: Icons will be simple, single-color (#5a7d9a), and rendered as SVG components.

5. Key UI Components (React + TypeScript)
NeumorphicButton.tsx

Props: onClick: () => void, children: React.ReactNode, className?: string

State: Manages an isPressed state (useState<boolean>) to toggle between extruded and inset shadow styles on mousedown/mouseup.

Appearance: Appears as a soft, extruded shape. Shadows invert on press for tactile feedback.

NeumorphicCard.tsx

Props: children: React.ReactNode, className?: string

Appearance: A large, extruded rectangle with soft, rounded corners. It will serve as the base for dashboard widgets and summary panels.

NeumorphicInput.tsx

Props: Standard input props (value, onChange, placeholder, type).

Appearance: A concave, inset shape. The onFocus event can add a subtle glow effect using an additional shadow to indicate the active state.

PlotContainer.tsx

Props: title: string, children: React.ReactNode

Appearance: An inset panel that frames the data visualization components (e.g., charts from Recharts), making them the focal point.

6. State Management & Data Flow
Client-Side State: Global state (like the user session) will be managed using Zustand or React Context for simplicity. Local component state (e.g., form inputs, loading toggles) will use the useState hook.

Data Fetching: Data fetching from the backend API will be handled by React Query (@tanstack/react-query). This will provide robust caching, background refetching, and simplified management of loading/error states out-of-the-box.

Authentication Flow:

The AuthForm.tsx component calls supabase.auth methods.

A global useAuth hook subscribes to onAuthStateChange.

The root App.tsx component uses the hook's output to render either the main application or the login page.

Diagnosis Flow:

User drops a file in UploadPage.tsx.

The component uploads the file to Supabase Storage and, on success, calls a mutation function (managed by React Query) that hits the backend /records endpoint.

The user is redirected to DiagnosticsPage.tsx with a record ID.

This page uses a React Query useQuery hook to poll the /diagnose/{record_id} endpoint until the status is "processed", then displays the final results.
