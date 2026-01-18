# Report Filtering UI Layout

## Visual Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Research Reports                          [↻ Refresh]        │
│ View and analyze your generated market intelligence reports  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│ │ Total Reports│  │  This Month  │  │Latest Report │       │
│ │      13      │  │      13      │  │  January 18  │       │
│ │   📄 [Icon] │  │   📈 [Icon] │  │   🕐 [Icon] │       │
│ └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                    SEARCH AND FILTERS                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                           │ │
│ │ [🔍 Search reports by title, category, geography...   ] │ │
│ │                                                           │ │
│ │                    [🔵 Filters (Active)] [✕ Clear]      │ │
│ │                                                           │ │
│ ├───────────────────────────────────────────────────────────┤ │
│ │ EXPANDED FILTER OPTIONS (when Filters button clicked)    │ │
│ │                                                           │ │
│ │ Category ▼    Type ▼       Geography ▼    Sort By ▼     │ │
│ │ [All      ]   [All   ]     [All      ]    [Date ↓   ]   │ │
│ │                                                           │ │
│ ├───────────────────────────────────────────────────────────┤ │
│ │ Showing 13 of 13 reports                                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                      REPORT CARDS                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📄  Real Estate - GoHighlevel CRM                        │ │
│ │                                                           │ │
│ │     [Real Estate] [On-demand]                            │ │
│ │     📅 January 18, 2026  📍 north-america               │ │
│ │     Focus: GoHighlevel CRM                               │ │
│ │                              [View Report →] [🗑️]       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📄  Telecommunications - GoHighlevel CRM                 │ │
│ │                                                           │ │
│ │     [Telecommunications] [On-demand]                     │ │
│ │     📅 January 18, 2026  📍 north-america               │ │
│ │     Focus: GoHighlevel CRM                               │ │
│ │                              [View Report →] [🗑️]       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ... more reports ...                                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Interactive Elements

### 1. Search Bar
```
┌───────────────────────────────────────────────────────┐
│ 🔍 Search reports by title, category, geography...   │
└───────────────────────────────────────────────────────┘
     ↑
     Real-time filtering as user types
```

### 2. Filter Button States

**Default State (No Filters):**
```
┌─────────────┐
│ 🔲 Filters  │  ← Outline style
└─────────────┘
```

**Active State (Filters Applied):**
```
┌─────────────────────────┐
│ 🔵 Filters [Active]     │  ← Solid blue style with badge
└─────────────────────────┘
```

**Expanded State:**
```
┌─────────────────────────┐
│ 🔵 Filters              │  ← Solid blue when panel is open
└─────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────┐
│ Category ▼          Type ▼                              │
│ ┌──────────────┐   ┌──────────────┐                    │
│ │ All          │   │ All          │                    │
│ │ Real Estate  │   │ On-demand    │                    │
│ │ Telecom...   │   │ Recurring    │                    │
│ └──────────────┘   └──────────────┘                    │
│                                                          │
│ Geography ▼         Sort By ▼                           │
│ ┌──────────────┐   ┌──────────────────────┐           │
│ │ All          │   │ Date (Newest First)  │           │
│ │ north-am...  │   │ Date (Oldest First)  │           │
│ │ Global       │   │ Title (A-Z)          │           │
│ └──────────────┘   │ Title (Z-A)          │           │
│                    │ Category (A-Z)       │           │
│                    └──────────────────────┘           │
└─────────────────────────────────────────────────────────┘
```

### 3. Clear Filters Button

**Hidden when no filters:**
```
[Nothing shown]
```

**Visible when filters active:**
```
┌───────────┐
│ ✕ Clear   │  ← Ghost style
└───────────┘
```

### 4. Results Counter

**Normal View:**
```
Showing 13 of 13 reports
```

**Filtered View:**
```
Showing 5 of 13 reports (filtered)
                        ^^^^^^^^^^^
                        Blue highlight
```

### 5. Filter Dropdowns

**Category Dropdown:**
```
Category ▼
┌──────────────────────┐
│ All Categories       │ ← Default option
├──────────────────────┤
│ Real Estate          │
│ Telecommunications   │
│ Healthcare           │
│ Technology           │
└──────────────────────┘
   ↑ Dynamically populated from reports
```

**Type Dropdown:**
```
Type ▼
┌──────────────────────┐
│ All Types            │ ← Default option
├──────────────────────┤
│ On-demand            │
│ Recurring            │
└──────────────────────┘
```

**Geography Dropdown:**
```
Geography ▼
┌──────────────────────┐
│ All Geographies      │ ← Default option
├──────────────────────┤
│ Global               │
│ north-america        │
│ europe               │
│ asia-pacific         │
└──────────────────────┘
   ↑ Dynamically populated from reports
```

**Sort By Dropdown:**
```
Sort By ▼
┌──────────────────────────┐
│ Date (Newest First)  ✓   │ ← Default, checkmark shown
├──────────────────────────┤
│ Date (Oldest First)      │
│ Title (A-Z)              │
│ Title (Z-A)              │
│ Category (A-Z)           │
└──────────────────────────┘
```

## Empty States

### No Matching Filters
```
┌───────────────────────────────────────────────┐
│                    🔍                          │
│                                                │
│         No reports match your filters         │
│                                                │
│    Try adjusting your search or filter        │
│              criteria                          │
│                                                │
│         [Clear All Filters]                   │
│                                                │
└───────────────────────────────────────────────┘
```

### No Reports At All
```
┌───────────────────────────────────────────────┐
│                    📄                          │
│                                                │
│              No reports yet                   │
│                                                │
│    Create your first market research          │
│         request to get started                │
│                                                │
│         [Create New Research]                 │
│                                                │
└───────────────────────────────────────────────┘
```

## Color Scheme

### Primary Colors
- **Blue (#3B82F6)**: Active filters, badges, links
- **Gray (#6B7280)**: Text, icons
- **Green (#10B981)**: Success stats
- **Purple (#A855F7)**: Latest report indicator
- **Red (#EF4444)**: Delete button hover

### Interactive States
- **Hover**: Slight background change
- **Active**: Solid blue background
- **Disabled**: 50% opacity
- **Focus**: Ring outline for accessibility

## Responsive Behavior

### Desktop (≥768px)
```
[Search Bar                                    ] [Filters] [Clear]

Category ▼    Type ▼    Geography ▼    Sort By ▼
[        ]    [     ]   [          ]   [       ]
```

### Mobile (<768px)
```
[Search Bar                    ]

[Filters] [Clear]

Category ▼
[                         ]

Type ▼
[                         ]

Geography ▼
[                         ]

Sort By ▼
[                         ]
```

## Animation Effects

### Transitions
- **Filter Panel**: Smooth expand/collapse
- **Dropdown Menus**: Fade in/out
- **Results Counter**: Number change animation
- **Refresh Icon**: Spinning animation during load

### Timing
- **Fast (150ms)**: Hover effects
- **Medium (300ms)**: Panel animations
- **Slow (500ms)**: Data loading

## Accessibility Features

### Keyboard Navigation
- **Tab**: Move between controls
- **Enter**: Activate buttons/dropdowns
- **Arrow Keys**: Navigate dropdown options
- **Escape**: Close dropdowns/panels

### Screen Reader Support
- Proper ARIA labels on all controls
- Announced filter state changes
- Descriptive button text
- Semantic HTML structure

### Focus Indicators
- Visible focus ring on all interactive elements
- High contrast for visibility
- Follows WCAG 2.1 guidelines

## Component Hierarchy

```
ReportsPage
│
├─── Header Section
│    ├── Title
│    └── Refresh Button
│
├─── Stats Cards Row
│    ├── Total Reports Card
│    ├── This Month Card
│    └── Latest Report Card
│
├─── Search and Filters Card
│    ├── Search Bar Row
│    │   ├── Search Input
│    │   └── Button Group
│    │       ├── Filters Button
│    │       └── Clear Button (conditional)
│    │
│    ├── Filter Options (collapsible)
│    │   ├── Category Select
│    │   ├── Type Select
│    │   ├── Geography Select
│    │   └── Sort By Select
│    │
│    └── Results Counter
│
└─── Reports List
     ├── Report Card 1
     ├── Report Card 2
     ├── Report Card 3
     └── ... (or Empty State)
```

## Implementation Notes

### State Management
All filter states are managed at the page component level, ensuring single source of truth.

### Performance
- useMemo prevents unnecessary recalculations
- Filters applied in sequence for efficiency
- No API calls during filtering (client-side only)

### Data Flow
```
User Input → State Update → useMemo Trigger → Filtered Results → UI Update
```

This visual layout provides a modern, intuitive interface for managing research reports with professional-grade filtering capabilities.

