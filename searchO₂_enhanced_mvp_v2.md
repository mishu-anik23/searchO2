# SearchO₂ — Enhanced Game Design & Development Specification

## 0. Document Purpose

This document converts the accepted reviewer feedback into an **implementation-oriented development specification for a coding agent**.

The objective is **not to rebuild SearchO₂ from scratch**.

The objective is to take the existing simulation foundations and progressively connect them into one coherent game:

> **Play → Discover → Understand → Decide → See Consequence → Earn → Unlock → Explore**

The player should not feel that they are completing a school curriculum.

They should feel that they are:

* building something,
* encountering problems,
* becoming curious,
* learning why those problems occur,
* applying knowledge,
* improving their world,
* unlocking new capabilities,
* and eventually expanding from Earth to space.

The reviewer explicitly identified that SearchO₂ already contains substantial foundations including the farm simulation, masterplan/task system, optional agriculture branches, botanical knowledge, ecological theory, workers, renewable energy, BESS, visitors, O₂ generation and long-term planetary expansion. Therefore, the next development priority should be **integration and progression design rather than indiscriminate addition of new systems**.

---

# 1. Core Product Identity

## 1.1 Permanent Game Identity

Internally define SearchO₂ as:

> **SearchO₂ is a playable journey about learning how to sustain life — from one plant on Earth to civilization beyond Earth.**

Every major feature should support this identity.

Before implementing a new feature, ask:

```text
Does this feature strengthen the player's journey
from sustaining life on Earth toward sustaining life beyond Earth?
```

If not, defer it.

---

# 2. The Permanent Progression Backbone

SearchO₂ should have four interconnected progression dimensions.

| Progression  | Represents         | Primary Purpose                        |
| ------------ | ------------------ | -------------------------------------- |
| 💰 Money     | Economic power     | Build, purchase, expand and operate    |
| 🌿 O₂        | Ecological power   | Demonstrate environmental productivity |
| 🧠 Knowledge | Intellectual power | Learn and unlock capabilities          |
| ⭐ Experience | Player journey     | Record progression and mastery         |

These should not be interchangeable currencies.

Each represents a different form of progression.

### Money

Used for:

* seeds,
* animals,
* buildings,
* machinery,
* workers,
* irrigation,
* infrastructure,
* renewable energy,
* efficiency improvements,
* commerce,
* research equipment,
* technology,
* land,
* regional expansion,
* space preparation.

### O₂

Used as an ecological progression metric.

It can eventually contribute to:

* regional access,
* environmental credentials,
* major sustainability milestones,
* space-program requirements.

### Knowledge

Represents what the player has actually discovered and understood.

Knowledge should unlock:

* information overlays,
* diagnostics,
* planning tools,
* efficiency capabilities,
* technology,
* advanced research,
* scientific systems.

### Experience

Tracks the player's overall journey.

Experience can support:

* player levels,
* chapter progression,
* achievements,
* historical milestones,
* discovery completion.

---

# 3. Core Gameplay Loop

Implement the game around this loop:

```text
PLAYER ACTION
      ↓
WORLD CHANGES
      ↓
RESULT / PROBLEM / DISCOVERY
      ↓
CURIOSITY
      ↓
KNOWLEDGE
      ↓
APPLICATION
      ↓
CONSEQUENCE
      ↓
REWARD
      ↓
NEW CAPABILITY
      ↓
BETTER DECISION
      ↓
STRONGER ECOSYSTEM
      ↓
NEW CHAPTER
```

This should replace a purely instruction-driven experience.

The reviewer specifically recommends changing:

```text
Build this
→ Build this
→ Hire this
→ Click this
→ Build this
```

into contextual missions where the player understands **why** something is needed before being asked to build it.

---

# 4. Existing Systems — Preserve and Reconnect

Do **not** discard these existing foundations:

* farm simulation,
* masterplan framework,
* contextual highlighting,
* optional expansions,
* botanical encyclopedia,
* ecological theory guides,
* workers,
* renewable energy,
* O₂ economy,
* visitors,
* progression,
* agriculture,
* livestock,
* pond,
* botanical garden,
* café,
* juice bar,
* equipment garage,
* BESS,
* eventual planetary expansion.

The existing sequential infrastructure progression should remain available as underlying logic.

Current foundation:

```text
Storage Barn
    ↓
Main Road
    ↓
Crew Shed
    ↓
Worker
    ↓
Soil + Plant
    ↓
Engineer
    ↓
Wind Turbine
    ↓
BESS
```

The important change is **presentation and player motivation**, not necessarily deletion of these prerequisites.

---

# 5. Development Principle: Contextual Missions

## 5.1 Replace Rigid Tutorial Steps

Do not present:

```text
Step 1: Build Storage
Step 2: Build Road
Step 3: Hire Worker
Step 4: Plant
```

Instead present a living world.

Example:

```text
Your first harvest is growing.

⚠️ Future harvest needs protection.

What could help?

[Explore Storage]
[Build Storage]
[Learn Why]
```

The player should understand the problem before receiving the solution.

---

# 6. Chapter-Based Progression

Replace the feeling of an eight-step tutorial with chapters.

## Chapter 1 — 🌱 Bring the Land to Life

### Player fantasy

> “I can grow something.”

### Systems

* soil,
* water,
* planting,
* basic crops,
* basic trees,
* photosynthesis,
* O₂.

### Learning

* plant requirements,
* photosynthesis,
* water,
* sunlight,
* CO₂,
* oxygen.

---

## Chapter 2 — 🚜 Build Your Farm

### Player fantasy

> “I can operate a farm.”

### Systems

* storage,
* roads,
* workers,
* logistics,
* production.

### Learning

* supply chains,
* storage,
* labour,
* transportation.

---

## Chapter 3 — 🌳 Build an Ecosystem

### Player fantasy

> “My choices affect nature.”

### Systems

* trees,
* flowers,
* bees,
* biodiversity,
* companion planting,
* agroforestry.

### Learning

* pollination,
* biodiversity,
* ecosystem relationships.

---

## Chapter 4 — ♻️ Close the Loop

### Player fantasy

> “Nothing should be wasted.”

### Systems

* livestock,
* manure,
* crops,
* water,
* waste,
* circular agriculture.

### Learning

* nutrient cycles,
* waste reduction,
* circular systems.

---

## Chapter 5 — ⚡ Power Your Community

### Player fantasy

> “I can create clean energy.”

### Systems

* wind,
* solar,
* engineers,
* BESS,
* electricity,
* energy storage.

### Learning

* renewable energy,
* generation,
* intermittency,
* storage,
* grid management.

---

## Chapter 6 — 🏘️ Build an Eco-Village

### Player fantasy

> “People depend on my system.”

### Systems

* visitors,
* café,
* juice bar,
* commerce,
* services,
* community.

### Learning

* sustainable economics,
* community systems,
* production/consumption.

---

## Chapter 7 — 🌍 Become Self-Sustaining

### Player fantasy

> “Everything works together.”

### Systems

* optimization,
* resilience,
* water,
* energy,
* biodiversity,
* circularity,
* economic stability.

### Learning

* systems thinking,
* sustainability,
* resilience.

---

## Chapter 8 — 🚀 Beyond Earth

### Player fantasy

> “Can I sustain life somewhere where Earth systems do not exist?”

This chapter connects:

```text
Earth sustainability
        ↓
Science
        ↓
Space technology
        ↓
Moon
        ↓
Mars
        ↓
Off-Earth ecosystem
```

---

# 7. First 10 Minutes — Required Gameplay Flow

The opening experience should be redesigned around discovery.

## 00:00 — Arrival

Show:

```text
🌍 Welcome to SearchO₂.

This land is yours.

Your challenge:

Turn it into a thriving,
sustainable community.
```

Primary button:

```text
🌱 Start Growing
```

Avoid a large tutorial screen.

---

## 00:30 — First Soil Interaction

Highlight an empty plot.

Message:

```text
Your soil is empty.

Prepare it for life.
```

Player:

1. selects plot,
2. prepares soil,
3. sees soil transformation,
4. receives animation/audio feedback,
5. receives initial XP.

---

## 01:30 — First Meaningful Choice

Show three beginner choices.

Example:

### 🍎 Apple Tree

* food,
* O₂,
* medium income,
* regular water.

### 🥕 Vegetable

* fast food production,
* water requirement,
* shorter growth cycle.

### 🌳 Oak

* slower economic return,
* ecological value,
* long-term O₂/biodiversity value.

The exact numerical balancing can be implemented later.

The important requirement is:

> **Show consequences before the player chooses.**

---

## 02:30 — First Discovery

After planting:

```text
🌱 Life has begun!

Plants use sunlight, water and CO₂
to produce energy and release oxygen.
```

Actions:

```text
📖 Discover Photosynthesis
```

Reward:

```text
+5 Knowledge XP
```

The educational content remains optional.

---

## 04:00 — Introduce Storage Through Need

Instead of:

```text
Build Storage Barn.
```

Create:

```text
⚠️ Your future harvest needs
somewhere safe.
```

Then introduce storage.

This establishes:

```text
Problem → Solution
```

rather than:

```text
Instruction → Construction
```

---

## 06:00 — Introduce Road

Create an actual logistical problem:

```text
🚚 Your farm is isolated.

Harvest cannot easily reach
your storage/market.
```

Then introduce road infrastructure.

---

## 08:00 — Introduce Workforce

Create a capacity problem:

```text
👷 Your farm is getting too large
to manage alone.
```

Then introduce:

* crew shed,
* worker,
* workforce management.

---

## 10:00 — First Major Milestone

Show:

```text
🎉 Your first sustainable farm
is operating!
```

Then reveal the wider world.

The player should feel:

> “I built something.”

not:

> “I completed Tutorial Step 8.”

---

# 8. Knowledge System

## 8.1 Add Knowledge XP

Knowledge XP is not simply another spendable currency.

It represents learning.

Examples:

```text
Read pollination information
→ +5 Knowledge XP

Correct quiz answer
→ +10 Knowledge XP

Create compatible companion planting
→ +20 Knowledge XP

Correctly diagnose plant disease
→ +15 Knowledge XP
```

---

# 9. Knowledge Levels

Suggested progression:

```text
Level 1 — 🌱 Eco Beginner
Level 2 — 🌿 Green Grower
Level 3 — 🌳 Ecosystem Builder
Level 4 — 🔬 Eco Scientist
Level 5 — 🌍 Planetary Ecologist
```

Future levels can expand into:

```text
Space Scientist
Astrobiologist
Planetary Systems Engineer
Off-Earth Ecologist
```

Do not overbuild this initially.

---

# 10. Library — Convert Reference Material Into Gameplay

The existing Library should become a core gameplay mechanic.

The reviewer notes that the existing Library already contains substantial botanical and ecological information including species information, photosynthesis, O₂, pollination, companion benefits, diseases, remedies and ecological/cultural information.

Change the relationship from:

```text
Library → Information
```

to:

```text
Game Problem
      ↓
Library Discovery
      ↓
Knowledge
      ↓
Gameplay Advantage
```

---

# 11. Example: Plant Disease Mechanic

Instead of:

```text
Click Cure
```

Use:

```text
🍎 Something is wrong with your tree.

Leaves are developing unusual spots.

What would you like to do?

[🔍 Diagnose]
[📖 Research]
[🧪 Treat]
```

If player chooses:

```text
📖 Research
```

open the relevant Library entry.

Player learns:

* disease,
* symptoms,
* cause,
* prevention,
* treatment.

Then return to the world.

Player applies the solution.

This creates:

```text
Problem
→ Research
→ Learn
→ Apply
→ Save Tree
```

That is the core educational game mechanic.

---

# 12. Three Learning Depths

Every major educational interaction should support three levels.

## 🌱 Quick Fact

1–2 simple sentences.

Target:

* children,
* casual players,
* fast gameplay.

---

## 🔬 Learn More

Provide:

* illustration,
* explanation,
* examples,
* interactive diagram.

---

## 📚 Deep Dive

Provide:

* scientific terminology,
* formulas,
* data,
* references where appropriate,
* advanced explanations.

### Example — Photosynthesis

Quick:

> Plants use sunlight, water and CO₂ to produce stored chemical energy while releasing oxygen.

Learn More:

```text
Sunlight → Leaf
CO₂ → Leaf
Water → Roots
O₂ → Atmosphere
```

Deep Dive:

```text
6CO₂ + 6H₂O + light
→ C₆H₁₂O₆ + 6O₂
```

One system therefore serves multiple ages and knowledge levels.

---

# 13. Dynamic “Why?” System

Introduce a reusable `Why?` interaction across the game.

Example:

```text
⚡ Wind Turbine
Cost: €275
Expected generation: 3 kWh/h
Requirement: Engineer

💡 Why do I need this?
```

Clicking opens:

> Wind converts kinetic energy from moving air into rotational mechanical energy and then electrical energy.

Then:

```text
📖 Learn More
```

opens the Library.

Apply this pattern to:

* Why fertilize?
* Why rotate livestock?
* Why plant flowers?
* Why store electricity?
* Why build roads?
* Why do trees produce oxygen?
* Why is biodiversity important?
* Why does off-Earth agriculture require closed-loop systems?

---

# 14. Discovery Cards

When the player encounters something for the first time, generate a Discovery Card.

Example:

```text
┌───────────────────────────────┐
│       NEW DISCOVERY            │
│                                │
│          🐝 Pollination        │
│                                │
│ Bees transfer pollen between   │
│ flowers, helping many plants   │
│ reproduce.                     │
│                                │
│ +5 Knowledge XP                │
│                                │
│ 📖 Add to Library              │
└───────────────────────────────┘
```

The Library should gradually become a collection.

This creates:

```text
Discovery
→ Collection
→ Completion motivation
```

rather than forcing the player to read an encyclopedia.

---

# 15. Knowledge → Gameplay Advantage

Knowledge should make the player more capable.

Examples:

| Knowledge        | Unlock                   |
| ---------------- | ------------------------ |
| Pollination      | 🐝 Pollinator Insight    |
| Renewable energy | ⚡ Energy Forecast        |
| Botany           | 🌱 Soil Compatibility    |
| Forestry         | 🌳 O₂ Forecast           |
| Livestock        | 🐄 Grazing Health        |
| BESS             | 🔋 Smart Charge Mode     |
| Water            | 💧 Irrigation Efficiency |
| Astronomy        | 🚀 Orbital Planning      |

Core rule:

> **Learning should make the player better at playing.**

---

# 16. Quiz System Redesign

The current quiz concept should be changed from a punitive mechanism into an optional challenge system.

Remove:

```text
Skip Quiz → +1 Demerit
```

Do not punish players for not taking an educational challenge.

Instead:

```text
📚 ECO CHALLENGE AVAILABLE!

Test what you've discovered.

Possible rewards:
• Research Point
• Rare Seed
• Efficiency Boost

[Take Challenge]
[Maybe Later]
```

---

# 17. Multiple Quiz Sizes

Use context-sensitive challenges.

### Micro Quiz

```text
1–3 questions
```

Used during normal gameplay.

### Eco Challenge

```text
5 questions
```

Used for normal progression.

### Scholar Challenge

```text
10 questions
```

Used for advanced knowledge/mastery.

---

# 18. Quiz Rewards

Prefer knowledge-related gameplay rewards over simple money rewards.

Example:

```text
Player learns three pollination questions.

Reward:
🐝 Pollinator Insight unlocked.

New capability:
Flower compatibility is now visible
when planting.
```

This creates:

```text
Knowledge
→ Understanding
→ Capability
→ Better Decision
```

---

# 19. Guide / Companion System

Introduce an optional ecological companion.

Possible identity:

```text
🌱 Oxy
```

or:

```text
🤖 O₂ Assistant
```

The companion must **not constantly interrupt gameplay**.

Example:

```text
💡 Oxy:

Your soil is getting dry.
Want to know why moisture matters?

[Show me]
[I'll handle it]
```

---

# 20. Guidance Modes

Add three modes:

```text
🟢 Guided
```

* frequent assistance,
* suitable for young players.

```text
🟡 Balanced
```

* contextual hints,
* normal default.

```text
⚪ Explorer
```

* minimal assistance,
* experienced players.

This allows one game to serve a wide age range without creating separate game modes.

---

# 21. Sustainability Journey

Replace the purely instructional Masterplan presentation with:

# 🌍 My Sustainability Journey

Example:

```text
Chapter 1 — Life
██████████ 100%

Chapter 2 — Farm
██████░░░░ 60%

Chapter 3 — Ecosystem
██░░░░░░░░ 20%

Chapter 4 — Energy
🔒

Chapter 5 — Eco-Village
🔒

Chapter 6 — Sustainable Earth
🔒

Chapter 7 — Space Program
🔒 🚀
```

Keep the existing architecture for:

* completed,
* active,
* locked,
* contextual information.

Change the presentation from:

> “tasks I must complete”

to:

> “world I am building.”

---

# 22. Consequence-Based Education

Do not primarily teach concepts through static statements.

Teach through consequences.

## Example — BESS

Wind turbines generate surplus electricity.

Without storage:

```text
⚠️ 17 kWh renewable electricity wasted.
```

Then:

```text
🔋 How could we save this energy?

[Research Energy Storage]
```

Library explains BESS.

Player builds BESS.

Next windy period:

```text
⚡ +17 kWh captured instead of wasted!
```

The player has learned:

```text
Renewable generation
→ intermittency
→ energy surplus
→ storage
→ BESS
```

without the game feeling like a lesson.

---

# 23. Player Choice After Onboarding

Once basic onboarding is complete, introduce strategic direction.

Prompt:

```text
🌿 What kind of sustainable community
do you want to build?
```

Choices:

### 🌳 Forest & Oxygen

```text
Trees
→ biodiversity
→ carbon/O₂
→ eco-tourism
```

### 🌾 Sustainable Agriculture

```text
Crops
→ livestock
→ processing
→ market
```

### ⚡ Renewable Energy

```text
Wind
→ BESS
→ microgrid
→ grid export
```

### 🏘️ Eco-Tourism

```text
Garden
→ pond
→ café
→ visitors
```

The player can eventually develop everything.

The choice determines what they explore first.

---

# 24. Technology Tree

Convert linear facility progression into a broader technology tree over time.

## 🌱 Agriculture

```text
Hand Farming
    ↓
Irrigation
    ↓
Tractor
    ↓
Precision Agriculture
    ↓
Autonomous Farming
    ↓
AI Agriculture
```

## ⚡ Energy

```text
Wind
    ↓
Solar
    ↓
BESS
    ↓
Microgrid
    ↓
Smart Grid
    ↓
Hydrogen
```

## 🌳 Ecology

```text
Trees
    ↓
Pollination
    ↓
Agroforestry
    ↓
Biodiversity
    ↓
Ecosystem Restoration
```

## 🔬 Science

```text
Basic Botany
    ↓
Soil Science
    ↓
Genetics
    ↓
Controlled Environment Agriculture
    ↓
Astrobiology
```

## 🚀 Space

```text
Astronomy
    ↓
Rocket Propulsion
    ↓
Orbital Mechanics
    ↓
Life Support
    ↓
Moon Mission
    ↓
Mars Mission
```

---

# 25. Economic Progression

Money should always have desirable uses.

The player should think:

> “If I earn another €5,000, what can I unlock?”

Money can purchase:

* seeds,
* animals,
* machinery,
* workers,
* land,
* irrigation,
* efficiency,
* solar/wind,
* buildings,
* cafés,
* research,
* technology,
* regional travel,
* space training,
* mission preparation,
* Moon equipment,
* Mars infrastructure.

---

# 26. Long-Term Financial Goals

Do not show only:

```text
Balance: €103,430
```

Instead show meaningful goals:

```text
🚀 MOON MISSION

Required funds: €120,000
Your funds: €103,430

€16,570 remaining
```

This turns ordinary farming into progress toward a meaningful objective.

---

# 27. O₂ as Eco Passport

Use generated O₂ as a major environmental progression mechanic.

Possible structure:

```text
🌿 ECO PASSPORT
```

Example:

```text
🇩🇪 Germany
Current region

🇸🇪 Sweden
Requires: 10,000 O₂

🇪🇸 Spain
Requires: 25,000 O₂

🇺🇸 USA
Requires: 60,000 O₂

🇧🇷 Brazil
Requires: 100,000 O₂

🇲🇬 Madagascar
Requires: 180,000 O₂
```

Do not make regions merely visual skins.

Each region should introduce meaningful environmental differences.

---

# 28. Regional Gameplay

## 🇧🇷 Brazil

Possible characteristics:

* tropical rainfall,
* tropical vegetation,
* biodiversity,
* temperature differences,
* soil differences,
* rainforest ecology.

Mission:

```text
Restore a degraded tropical ecosystem.
```

---

## 🇲🇬 Madagascar

Possible characteristics:

* endemic species,
* unique ecosystems,
* water challenges,
* restoration opportunities.

---

## 🇸🇪 Sweden

Possible characteristics:

* cold seasons,
* boreal forests,
* seasonal daylight,
* renewable-energy decisions.

The regional system should teach:

* geography,
* ecology,
* climate,
* biodiversity.

---

# 29. Interactive Earth Globe

Create a future interactive Earth interface.

Player can:

* rotate Earth,
* inspect regions,
* view locked regions,
* see O₂ requirements,
* see discoveries,
* inspect missions,
* travel when requirements are satisfied.

Example:

```text
🇧🇷 BRAZIL

🔒 Eco Passport required

O₂ required: 100,000
Current: 76,350

🌳 28 unique species
🦜 15 biodiversity discoveries
🌧️ Tropical ecology

🏆 Regional Mission Available

Progress:
███████░░░ 76%
```

---

# 30. Space Progression Requirements

Space must require more than money.

Example:

# 🌕 Moon Mission

Requirements:

```text
💰 Financial
€120,000

🧠 Knowledge
Space Science Level 4

🌿 Sustainability
250,000 lifetime O₂
```

This expresses the central SearchO₂ philosophy:

```text
Economy
+
Ecology
+
Knowledge
=
Space Readiness
```

---

# 31. Mission Control

Before a space mission:

```text
🚀 MISSION CONTROL

Destination: Moon

Mission Readiness: 67%

✓ Funding
✓ Rocket
✓ Crew
✓ Fuel
✓ Weather

✗ Navigation
✗ Life Support
✓ Launch Window
```

Every missing requirement should be explorable.

Example:

```text
Why can't I launch today?
```

Then show the relevant educational content.

---

# 32. Space Mission Should Be Playable

Do not turn the space mission into a cinematic cutscene.

The player should experience:

```text
Earth
 ↓
Ignition
 ↓
Atmospheric ascent
 ↓
Max-Q
 ↓
Staging
 ↓
Orbit
 ↓
Earth view
 ↓
Orbital transfer
 ↓
Deep space
 ↓
Moon approach
 ↓
Lunar orbit
 ↓
Descent
 ↓
Moon surface
```

At relevant moments provide optional information.

Example:

```text
🌍 380 km above Earth

You've crossed most of Earth's atmosphere.

[🔬 Explain]
```

or:

```text
🌕 Distance to Moon:
147,300 km

Current velocity:
1.02 km/s

[🔬 Explain]
```

---

# 33. Astronomy Exploration Mode

During space travel, introduce:

```text
🔭 Astronomy Mode
```

Possible information layers:

* stars,
* constellations,
* planets,
* distances,
* orbital paths,
* spacecraft trajectory.

Example:

```text
⭐ Sirius
Click → Information

🪐 Jupiter
Click → Information

🌌 Andromeda Galaxy
Click → Information

🌙 Moon
Click → Information
```

The player effectively receives a playable planetarium.

---

# 34. Personal World Persistence

Make the farm emotionally personal.

Allow players to name:

* farm,
* animals,
* vehicles,
* important trees,
* spacecraft.

Example:

```text
🌳 My First Apple Tree

Planted: Day 1
Age: 8 years
Total fruit: 487 kg
Lifetime O₂: 14,280 units
```

Later:

```text
🏆 LEGACY TREE

This was the first tree planted
when Green Valley Farm was founded.
```

The world should remember player actions.

---

# 35. Living Visitors

Existing visitor-oriented facilities should become interactive.

Example:

```text
👨‍👩‍👧 Tourist:

“I'd love somewhere to drink fresh juice.”
```

Player builds juice bar.

Later:

```text
“This apple juice came from trees
grown right here!”

+€8
+Reputation
```

Student:

```text
“Can I learn about wind energy?”
```

If the player has appropriate facilities:

```text
+Knowledge Reputation
```

Farmer:

```text
“Your irrigation system is impressive.”
```

Retail buyer:

```text
“Can you supply 100 kg apples?”
```

Visitors should react to what the player actually builds.

---

# 36. Contract System

Introduce contracts to create economic objectives.

Example:

```text
🏫 FRANKFURT SCHOOL CONTRACT

Required:

🍎 150 kg apples
🥕 100 kg vegetables

Delivery:
5 days

Reward:
💰 €1,500
⭐ +20 Reputation
```

Future contract customers:

* hotels,
* restaurants,
* supermarkets,
* universities,
* municipalities,
* research institutions,
* space agencies.

Advanced example:

```text
🚀 SPACE AGENCY CONTRACT

Produce:

500 kg food

Requirement:

<30% conventional water consumption
```

This connects farming knowledge with future space agriculture.

---

# 37. Achievements

Achievements should represent meaningful accomplishments.

Avoid:

```text
Clicked 100 times
```

Prefer:

```text
🌱 First Life
Grow first plant

🐝 Bee Friend
Establish pollinator habitat

💧 Every Drop Counts
Reduce irrigation use by 25%

⚡ Powered by Nature
Run farm entirely from renewable energy

♻️ Closed Loop
Recycle farm waste

🌳 Forest Guardian
Generate 100,000 O₂

🌍 Global Ecologist
Operate on three continents

🔬 Eco Scholar
Complete 50 discoveries

🚀 Leaving Home
Reach Earth orbit

🌕 One Small Step
Reach Moon

🔴 New World
Reach Mars
```

Achievements should become memories of the player's journey.

---

# 38. Dynamic Events

Introduce controlled uncertainty.

Possible events:

* heavy rain,
* heatwave,
* pest outbreak,
* strong wind,
* power shortage,
* animal illness,
* pollinator boom,
* fruit-price increase,
* tourist season,
* grid demand event,
* storm damage.

Example:

```text
☀️ HEATWAVE

Soil moisture is falling rapidly.

What will you do?

💧 Increase irrigation
🌾 Apply mulch
🌳 Use agroforestry shade
📖 Research heat resilience
```

Different choices should produce different consequences.

Do not always provide one universally correct answer.

---

# 39. Sustainability Dashboard

Create a transparent sustainability dashboard.

Example:

```text
🌍 FARM SUSTAINABILITY

Overall: 82 / 100

Biodiversity
████████░░ 82

Renewable Energy
█████████░ 94

Water Efficiency
███████░░░ 73

Soil Health
████████░░ 85

Circularity
██████░░░░ 65

Economic Stability
█████████░ 91
```

Every metric should be explainable.

Example:

```text
Why is Circularity only 65?
```

opens relevant explanations and recommendations.

The dashboard therefore becomes another educational interface.

---

# 40. Failure Design

Failure must be recoverable.

Avoid:

```text
FARM BANKRUPT
GAME OVER
```

Instead:

```text
⚠️ Your farm is experiencing
financial difficulty.

Advisor recommendations:

• Sell surplus inventory
• Pause expansion
• Reduce temporary workers
• Accept a local contract

📖 Learn about farm economics
```

The failure state itself becomes a learning opportunity.

---

# 41. Final Game Progression

The intended long-term progression is:

```text
🌱 PLANT
   ↓
🌾 FARM
   ↓
🍎 PRODUCE
   ↓
💰 EARN
   ↓
🌳 BUILD ECOSYSTEM
   ↓
🍃 GENERATE O₂
   ↓
🧠 DISCOVER & LEARN
   ↓
❓ CHALLENGE
   ↓
🔬 UNLOCK KNOWLEDGE
   ↓
🌍 UNLOCK REGION
   ↓
🇩🇪 → 🇸🇪 → 🇪🇸 → 🇺🇸 → 🇧🇷 → 🇲🇬
   ↓
🏘️ BUILD SUSTAINABLE COMMUNITIES
   ↓
⚡ MASTER ENERGY
   ↓
💧 MASTER WATER
   ↓
♻️ MASTER CIRCULAR SYSTEMS
   ↓
💰 BUILD WEALTH
   ↓
🔬 ADVANCE SCIENCE
   ↓
🚀 UNLOCK SPACE PROGRAM
   ↓
🌍 EARTH ORBIT
   ↓
🔭 EXPLORE ASTRONOMY
   ↓
🌕 MOON
   ↓
🧪 LEARN LIFE SUPPORT
   ↓
🌱 GROW LIFE OFF-EARTH
   ↓
🔴 MARS
   ↓
🏘️ BUILD FIRST OFF-EARTH ECOSYSTEM
```

---

# 42. Technical Gameplay Architecture

The implementation should eventually reflect the following conceptual architecture:

```text
                         SEARCHO₂
                            │
                            ▼
                      PLAYER ACTION
                            │
                            ▼
                          WORLD
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
          RESULT          PROBLEM       DISCOVERY
             │              │              │
             └──────────────┼──────────────┘
                            ▼
                         CURIOSITY
                            │
                            ▼
                         KNOWLEDGE
                            │
                         LIBRARY
                            │
                 ┌──────────┴──────────┐
                 ▼                     ▼
             QUICK FACT            DEEP LEARNING
                 │                     │
                 └──────────┬──────────┘
                            ▼
                         KNOWLEDGE
                            │
                            ▼
                    QUIZ / CHALLENGE
                            │
                            ▼
                         REWARD
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
           ABILITY       EFFICIENCY    DISCOVERY
           UNLOCK          BONUS         UNLOCK
              │             │             │
              └─────────────┼─────────────┘
                            ▼
                     BETTER DECISIONS
                            │
                            ▼
                    STRONGER ECOSYSTEM
                            │
                            ▼
                       NEW CHAPTER
                            │
                            ▼
                 FARM → ECO-VILLAGE
                            ↓
                          EARTH
                            ↓
                          MOON
                            ↓
                          MARS
```

---

# 43. Suggested Internal Game-State Model

The coding agent should treat the world as one persistent simulation state.

Conceptually:

```text
GameState
├── player
│   ├── experience
│   ├── knowledgeXP
│   ├── knowledgeLevel
│   └── guidanceMode
│
├── economy
│   ├── balance
│   ├── income
│   ├── expenses
│   └── contracts
│
├── ecology
│   ├── oxygen
│   ├── biodiversity
│   ├── soilHealth
│   ├── waterEfficiency
│   ├── circularity
│   └── renewableEnergy
│
├── farm
│   ├── plots
│   ├── crops
│   ├── trees
│   ├── livestock
│   └── buildings
│
├── infrastructure
│   ├── roads
│   ├── storage
│   ├── crew
│   ├── energy
│   └── water
│
├── knowledge
│   ├── discoveries
│   ├── libraryEntries
│   ├── quizzes
│   └── unlockedCapabilities
│
├── progression
│   ├── currentChapter
│   ├── missions
│   ├── achievements
│   └── technologyTree
│
├── world
│   ├── regions
│   ├── unlockedRegions
│   ├── events
│   └── environment
│
└── space
    ├── readiness
    ├── missions
    ├── spacecraft
    ├── astronomy
    └── offEarthSystems
```

This is a conceptual target, not a requirement to immediately refactor the entire codebase.

---

# 44. Development Roadmap

Do not implement all proposed systems simultaneously.

Implement progressively.

---

## Phase 0 — Existing-System Audit

### Goal

Understand and preserve the existing architecture.

### Tasks

1. Inspect current codebase.
2. Identify existing:

   * game state,
   * task/masterplan system,
   * Library,
   * botanical system,
   * economy,
   * O₂,
   * buildings,
   * workers,
   * energy,
   * BESS,
   * visitors,
   * progression.
3. Map existing components to the new architecture.
4. Identify duplicate systems.
5. Avoid unnecessary rewrites.

### Deliverable

Create an implementation map:

```text
Existing System
→ New Role
→ Files/Modules
→ Dependencies
→ Required Changes
```

---

# Phase 1 — Core Progression Backbone

Implement:

* Money,
* O₂,
* Knowledge XP,
* Experience,
* chapters,
* mission state,
* persistent progression.

Do not yet implement the full global/world/space systems.

### Acceptance Criteria

The player can:

```text
earn money
generate O₂
gain Knowledge XP
gain Experience
progress through chapters
```

and the state persists correctly.

---

# Phase 2 — Mission-Based Onboarding

Replace rigid tutorial presentation with contextual missions.

Implement:

```text
Problem
→ Contextual Mission
→ Player Choice
→ Consequence
```

Build the first 10-minute experience.

### Acceptance Criteria

A new player can:

1. arrive,
2. prepare soil,
3. choose a plant,
4. learn photosynthesis,
5. encounter storage need,
6. build storage,
7. encounter logistics need,
8. build road,
9. encounter workforce need,
10. recruit worker,
11. reach first sustainable farm milestone.

---

# Phase 3 — Knowledge & Library Integration

Implement:

* Knowledge XP,
* Discovery Cards,
* Quick Fact,
* Learn More,
* Deep Dive,
* Why buttons,
* Library contextual links.

### Acceptance Criteria

A gameplay event can automatically trigger:

```text
World Event
→ Knowledge Opportunity
→ Library
→ Discovery
→ Knowledge XP
→ Capability
```

---

# Phase 4 — Problem-Solving Mechanics

Add contextual problems.

Initial targets:

1. plant disease,
2. soil moisture,
3. storage,
4. energy surplus,
5. irrigation,
6. pollination.

Each problem must have:

* visible consequence,
* multiple possible actions,
* optional research,
* measurable result.

---

# Phase 5 — Quiz & Knowledge Rewards

Implement:

* Micro Quiz,
* Eco Challenge,
* Scholar Challenge,
* non-punitive rewards,
* knowledge-based unlocks.

Remove demerit-based quiz skipping.

---

# Phase 6 — Technology Tree

Introduce:

* Agriculture,
* Ecology,
* Energy,
* Science.

Space technology should remain visible as a long-term destination but does not need to be fully playable yet.

---

# Phase 7 — Living World

Implement:

* visitors,
* contracts,
* meaningful achievements,
* dynamic events,
* sustainability dashboard,
* recoverable failures.

---

# Phase 8 — Regional Earth Expansion

Implement:

* Eco Passport,
* O₂-based regional unlocking,
* interactive Earth globe,
* regional environmental differences,
* regional missions.

Do not simply reskin the same map.

---

# Phase 9 — Space Preparation

Implement:

* Space Science,
* mission readiness,
* spacecraft,
* funding,
* crew,
* fuel,
* navigation,
* life support,
* launch windows.

---

# Phase 10 — Playable Space Journey

Implement:

```text
Launch
→ Orbit
→ Transfer
→ Moon Approach
→ Lunar Orbit
→ Descent
→ Surface
```

Add Astronomy Mode.

---

# Phase 11 — Moon Ecosystem

The Moon should become a new simulation environment.

Introduce concepts such as:

* closed-loop life support,
* water recovery,
* controlled agriculture,
* oxygen generation,
* energy storage,
* resource management,
* habitat systems.

---

# Phase 12 — Mars

Only after the Moon gameplay foundation is stable.

Progression:

```text
Moon
→ Off-Earth Agriculture
→ Life Support Mastery
→ Planetary Science
→ Mars Mission
→ Mars Settlement
→ First Off-Earth Ecosystem
```

---

# Phase 13 — XR Architecture

Architect the game so that simulation state is independent of presentation.

Conceptually:

```text
                 SEARCHO₂ WORLD
                       │
                   SIMULATION
                       │
          ┌────────────┼────────────┐
          │            │            │
       Economy      Ecology      Science
          │            │            │
          └────────────┼────────────┘
                       │
                    GAME STATE
                       │
              ┌────────┴────────┐
              │                 │
            2D/3D UI           XR
              │                 │
        PC / Mobile      Quest / Vision / PICO
```

The same:

* farm,
* tree,
* turbine,
* economy,
* spacecraft,
* Moon,
* discoveries

should exist in the same simulation regardless of presentation mode.

---

# 45. UX Rules for the Coding Agent

## Rule 1 — Never interrupt unnecessarily

Education should be discoverable, not constantly forced.

---

## Rule 2 — Show consequences

Prefer:

```text
17 kWh wasted
```

over:

```text
BESS stores renewable energy.
```

---

## Rule 3 — Explain before requiring

When possible:

```text
Problem
→ Explanation
→ Decision
```

rather than:

```text
Requirement
→ Click
```

---

## Rule 4 — Preserve player agency

After onboarding, provide meaningful choices.

---

## Rule 5 — Avoid punishment for learning

Quizzes should reward participation.

---

## Rule 6 — Make knowledge useful

Every significant educational mechanic should ideally connect to gameplay capability.

---

## Rule 7 — Make failure recoverable

Bad decisions should produce consequences and learning opportunities rather than unnecessary game-over states.

---

## Rule 8 — Don't overbuild

The existing game already contains substantial systems.

Prioritize:

```text
Integration
> New Features
```

---

# 46. Definition of Done for the Core Redesign

The redesign should be considered successful when the following experience is possible:

```text
Player plants something
        ↓
Something happens
        ↓
Player becomes curious
        ↓
Player discovers information
        ↓
Player understands why
        ↓
Player applies knowledge
        ↓
World improves
        ↓
Player earns a meaningful reward
        ↓
New capability unlocks
        ↓
Player makes better decisions
        ↓
New chapter becomes available
```

The player should naturally experience:

> **“I did something → something happened → I wanted to know why → I learned → I used that knowledge → my world improved.”**

That is the permanent gameplay-learning loop.

---

# 47. Priority Matrix

## P0 — Implement First

* [ ] Existing-system audit
* [ ] Core progression state
* [ ] Money / O₂ / Knowledge / Experience
* [ ] Chapter model
* [ ] Contextual mission framework
* [ ] First 10-minute onboarding
* [ ] Library integration
* [ ] Discovery Cards
* [ ] Knowledge XP
* [ ] Why buttons

---

## P1 — Core Gameplay

* [ ] Contextual problems
* [ ] Plant diagnosis
* [ ] BESS consequence mechanic
* [ ] Micro quizzes
* [ ] Knowledge unlocks
* [ ] Three learning depths
* [ ] Guidance modes
* [ ] Sustainability Journey

---

## P2 — Simulation Depth

* [ ] Technology tree
* [ ] Visitors
* [ ] Contracts
* [ ] Dynamic events
* [ ] Achievements
* [ ] Sustainability dashboard
* [ ] Recoverable failure

---

## P3 — World Expansion

* [ ] Eco Passport
* [ ] O₂ regional unlocking
* [ ] Interactive Earth
* [ ] Regional environments
* [ ] Regional missions

---

## P4 — Space

* [ ] Space technology
* [ ] Mission Control
* [ ] Mission readiness
* [ ] Launch gameplay
* [ ] Orbital journey
* [ ] Astronomy Mode
* [ ] Moon simulation

---

## P5 — Long-Term Vision

* [ ] Mars
* [ ] Off-Earth ecosystem
* [ ] XR-ready world architecture
* [ ] Spatial farm
* [ ] Spatial Moon
* [ ] Spatial Mars

---

# 48. Final Implementation Directive

The coding agent should **not attempt to implement every idea in this document in one pass**.

Use incremental development.

For each phase:

1. inspect existing implementation,
2. identify reusable systems,
3. modify the smallest necessary architecture,
4. implement the feature,
5. test existing functionality,
6. test the new gameplay flow,
7. verify persistence,
8. verify UI states,
9. verify progression/unlock conditions,
10. document the completed phase,
11. only then proceed to the next phase.

Avoid large speculative refactors.

Avoid replacing working systems merely for stylistic reasons.

Prefer:

```text
Existing System
      ↓
Extend
      ↓
Connect
      ↓
Expose Through New Gameplay Loop
```

over:

```text
Existing System
      ↓
Delete
      ↓
Rewrite
```

---

# 49. Permanent Design Principle

The entire SearchO₂ experience should ultimately feel like one continuous journey:

```text
🌱 One Plant
     ↓
🌾 One Farm
     ↓
🌳 One Ecosystem
     ↓
🏘️ One Sustainable Community
     ↓
🌍 One Sustainable Earth
     ↓
🔬 Scientific Advancement
     ↓
🚀 Space Program
     ↓
🌕 Moon
     ↓
🧪 Off-Earth Life Support
     ↓
🌱 Off-Earth Agriculture
     ↓
🔴 Mars
     ↓
🏘️ First Off-Earth Ecosystem
```

The player should never feel that a separate “space game” suddenly starts.

Space is the consequence of everything they learned before.

The fundamental progression is:

```text
💰 MONEY
Economic Power
        +
🌿 O₂
Ecological Power
        +
🧠 KNOWLEDGE
Intellectual Power
        +
⭐ EXPERIENCE
Player Journey
        ↓
SUSTAINABILITY MASTERY
        ↓
PLANETARY MASTERY
        ↓
SPACE
        ↓
OFF-EARTH LIFE
```

The central design objective is therefore:

> **Do not make players learn so they can play SearchO₂. Make learning itself increase their ability to play SearchO₂.**

That is the backbone around which the existing simulation, education system, economy, ecology, technology progression, Earth exploration, Moon gameplay, Mars gameplay and future XR experience should be connected.
