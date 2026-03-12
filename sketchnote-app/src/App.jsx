import { useState, useEffect } from "react";

// ─── PERSONALIZED DATA ────────────────────────────────────────────────────────
const profile = {
  level: "Doodler",
  hoursPerWeek: "3–5 hrs",
  goals: ["Work meetings", "Journaling", "Learning & studying", "Social media"],
  pace: "~12 weeks total · 2 weeks per module",
};

const GOALS_META = {
  "Work meetings":    { icon: "💼", color: "#60A5FA" },
  "Journaling":       { icon: "📔", color: "#F472B6" },
  "Learning & studying": { icon: "🎓", color: "#34D399" },
  "Social media":     { icon: "📸", color: "#FBBF24" },
};

const curriculum = [
  {
    id: 1,
    emoji: "✏️",
    title: "Shape Language & Mark-Making",
    subtitle: "Build confidence with the 5 universal shapes",
    duration: "Weeks 1–2",
    hoursNeeded: "6–8 hrs",
    relevance: ["Work meetings", "Journaling"],
    accent: "#F472B6",
    lessons: [
      {
        id: "1a", title: "The 5 Universal Shapes",
        time: "25 min",
        body: `Everything you'll ever draw reduces to five marks:\n\n● **Circle** → faces, wheels, badges, speech bubbles\n▭ **Rectangle** → screens, books, slides, signs\n△ **Triangle** → arrows, progress, mountains, emphasis\n〰 **Wavy line** → flow, energy, connections, dividers\n· **Dot** → bullets, eyes, emphasis, decoration\n\n**Why this matters for you:**\nAs a doodler you already make these marks intuitively — now you'll make them *on purpose*. In a work meeting, you're not drawing a laptop; you're drawing a rectangle with two lines. That's it.\n\n**Practice drill (15 min):**\n1. Fill a page with each shape × 20, varying size\n2. Combine: circle + rectangle = robot. Triangle + rectangle = house. Dot + wavy = face.\n3. Notice which feel natural — lean into those first.`,
        takeaway: "You don't draw things. You draw shapes that look like things.",
      },
      {
        id: "1b", title: "Line Confidence & Pen Pressure",
        time: "20 min",
        body: `Shaky lines aren't a skill problem — they're a speed + intention problem.\n\n**Two fixes:**\n1. **Draw faster** — slow lines wobble. A swift confident stroke looks intentional.\n2. **Anchor your elbow** — move your whole forearm, not your wrist.\n\n**Line types you'll use constantly:**\n- Straight lines: timelines, containers, dividers\n- Curved lines: connectors, flow arrows\n- Dashed lines: secondary info, alternatives\n- Thick lines: emphasis (press harder or double-stroke)\n\n**The "wobbly is fine" rule:**\nIn sketchnotes, slight imperfection reads as *hand-crafted and human*, not messy. Embrace it. Perfect lines look cold and corporate.`,
        takeaway: "Draw faster. Anchor your elbow. Wobbly = charming.",
      },
      {
        id: "1c", title: "Your First Icon Vocabulary (10 icons)",
        time: "30 min",
        body: `Start with 10 icons that cover 80% of meetings and journal entries:\n\n1. 💡 Lightbulb → idea\n2. ⭐ Star → important\n3. ❓ Circle-Q → question\n4. → Arrow → action / next step\n5. 👤 Simple person → people / team\n6. 🗓 Calendar square → date / deadline\n7. 💬 Speech bubble → communication\n8. ⬆ Up arrow in box → growth / increase\n9. 🔗 Chain link → connection / related\n10. ✅ Checkbox → done / complete\n\n**How to drill them:**\nSet a 5-minute timer. Draw all 10 from memory. Repeat daily for 2 weeks. You want these to be *automatic* — like signing your name.`,
        takeaway: "10 automatic icons + 5 shapes = enough to sketchnote anything.",
      },
    ],
    quiz: {
      title: "Module 1 Check-In",
      qs: [
        {
          q: "A rectangle with a small camera icon on top represents what in a sketchnote?",
          opts: ["A book", "A laptop or screen", "A door", "A TV remote"],
          ans: 1,
          explain: "Rectangle = screen/device. A tiny camera notch makes it a laptop. Simple shape combinations create recognizable objects instantly.",
        },
        {
          q: "Why should you draw lines FASTER rather than slower?",
          opts: [
            "To finish the page quickly",
            "Fast lines look more confident and wobble less",
            "Slower lines use more ink",
            "Speed doesn't matter for line quality",
          ],
          ans: 1,
          explain: "Slow lines wobble because your hand corrects mid-stroke. A fast stroke is one fluid motion — it looks intentional even if slightly curved.",
        },
        {
          q: "You're in a work meeting. The speaker says 'we need to connect team A to team B.' Which icon do you reach for?",
          opts: ["Lightbulb", "Star", "Chain link / arrow", "Checkbox"],
          ans: 2,
          explain: "Chain link or double-headed arrow instantly communicates connection/relationship. That's exactly the kind of automatic visual vocabulary you're building.",
        },
      ],
    },
    project: {
      title: "The Shape Inventory",
      goal: "Work meetings",
      desc: "Flip through your calendar and pick ONE meeting from last week. Reconstruct what was discussed using ONLY shapes and your 10 icons — no real words. Can someone else understand the gist from your page?",
      deliverable: "1 wordless sketchnote of a past meeting. Share to #sketchnotes on Instagram as your first post.",
      tips: ["Keep icons under 2cm — speed over size", "Use arrows to show flow between ideas", "Date the page — your future self will thank you"],
    },
  },
  {
    id: 2,
    emoji: "🔤",
    title: "Lettering & Visual Hierarchy",
    subtitle: "Make your words as powerful as your drawings",
    duration: "Weeks 3–4",
    hoursNeeded: "7–9 hrs",
    relevance: ["Work meetings", "Social media"],
    accent: "#FBBF24",
    lessons: [
      {
        id: "2a", title: "The 4-Style Lettering System",
        time: "30 min",
        body: `You need exactly 4 lettering styles — not fonts, just pen techniques:\n\n**1. ALL CAPS PRINT** (titles & headlines)\nCapital letters, equal height, slight spacing between letters.\n*Use for:* Meeting title, journal date, sketchnote header\n\n**2. lowercase print** (body notes)\nSmall, quick, consistent height. Your workhorse style.\n*Use for:* 90% of all note content\n\n**3. BOLD CAPS** (emphasis)\nSame as caps, but trace the left stroke twice or thicken with a broad marker.\n*Use for:* Key decisions, action items, stats\n\n**4. *Italic*** (quotes, secondary info)\nSlant your letters 15° right. Signals: "someone said this."\n*Use for:* Direct quotes, asides, softer info\n\n**Hierarchy rule:** Title = 3× body size. Key word = 1.5× body. Detail = body size.`,
        takeaway: "4 styles × 3 sizes = a complete visual language for any note.",
      },
      {
        id: "2b", title: "Containers: Boxing Ideas",
        time: "25 min",
        body: `Containers frame and emphasize text. Learn 6 and you're set:\n\n1. **Simple box** → default, clean, professional\n2. **Rounded box** → friendlier, warmer feel\n3. **Speech bubble** → "someone said this"\n4. **Thought bubble** → idea, internal, uncertain\n5. **Banner/ribbon** → for titles and section headers\n6. **Starburst** → urgent, surprising, key insight\n\n**The container rule:**\nAlways write text FIRST. Draw the container AFTER, sized to fit. Never cram text into a pre-drawn box.\n\n**Shadows make containers pop:**\nDraw the box. Then, 2mm to the right and 2mm down, draw the same shape. Fill that offset shape dark. Instant depth.\n\n**For work meetings:** Use speech bubbles for decisions made. Starburst for "this is the key takeaway."`,
        takeaway: "Write first, contain second. Shadows add depth in 10 seconds.",
      },
      {
        id: "2c", title: "Connectors & Visual Flow",
        time: "20 min",
        body: `Connectors show *how ideas relate* — they're as important as the ideas themselves.\n\n**5 connector types:**\n→ **Straight arrow** — sequence, cause-and-effect\n↔ **Double arrow** — mutual relationship\n⤵ **Curved arrow** — looping back, feedback\n- - - → **Dashed arrow** — maybe, alternative, softer link\n**Bold line** — hard separation between sections\n\n**Sketchnoting for social media:**\nConnectors make visual flow obvious to someone scrolling past. An arrow from "problem" to "solution" tells a story in 0.5 seconds — the time you have on Instagram.\n\n**Meeting tip:** Draw a light timeline line across the bottom of your page. As the meeting progresses, add decision diamonds ◇ along the line.`,
        takeaway: "Arrows tell stories. Use them generously — they're free.",
      },
    ],
    quiz: {
      title: "Module 2 Check-In",
      qs: [
        {
          q: "You want to highlight a key decision from a meeting. Which lettering style?",
          opts: ["lowercase print", "Italic", "BOLD CAPS", "Any style, it doesn't matter"],
          ans: 2,
          explain: "BOLD CAPS = high importance. It signals 'this matters' without any words needing to say so. Great for action items and key decisions.",
        },
        {
          q: "When should you draw the container (box/bubble)?",
          opts: [
            "Before writing, so you know how much space you have",
            "After writing, sized around the text",
            "Containers should always be the same size",
            "Only around titles, never body text",
          ],
          ans: 1,
          explain: "Always write first! Pre-drawn boxes lead to cramped, awkward text. Let the container grow naturally from the content.",
        },
        {
          q: "For an Instagram sketchnote, which connector best shows 'Problem → Solution'?",
          opts: ["A double arrow ↔", "A dashed line", "A bold straight arrow →", "No connector needed"],
          ans: 2,
          explain: "A bold straight arrow communicates cause-and-effect instantly — even to someone who glances for half a second. Perfect for social media.",
        },
      ],
    },
    project: {
      title: "Journal Page Redesign",
      goal: "Journaling",
      desc: "Take yesterday's journal entry (or write one now). Re-sketchnote it using all 4 lettering styles, at least 3 containers, and 3 connector types. The goal: someone should understand your mood and key events just by *looking* — without reading every word.",
      deliverable: "One sketchnote journal page. Take a photo with good lighting — this one's worth sharing.",
      tips: ["Bold the most important emotion of the day", "Speech bubbles for things you said or thought", "Use a banner for the date and mood rating"],
    },
  },
  {
    id: 3,
    emoji: "👤",
    title: "People & Expressions",
    subtitle: "Add human characters that communicate emotion",
    duration: "Weeks 5–6",
    hoursNeeded: "6–8 hrs",
    relevance: ["Journaling", "Social media"],
    accent: "#34D399",
    lessons: [
      {
        id: "3a", title: "The 5-Step Face Formula",
        time: "25 min",
        body: `You can draw an expressive face in under 10 seconds:\n\n1. Circle (head)\n2. Two dots (eyes — position determines expression)\n3. Curve (mouth — up/down = happy/sad)\n4. Two short strokes above eyes (brows for nuance)\n5. Optional: ears, hair, glasses\n\n**Eye position hacks:**\n- Eyes at top 1/3 = childlike, curious\n- Eyes at center = neutral adult\n- Eyes close together = intense\n- Eyes wide apart = relaxed, open\n\n**For journaling:** Keep a 1-row "emotion strip" at the top of each journal sketchnote — tiny faces rating your day visually.\n\n**For social media:** A face-forward character makes your sketchnote relatable. People connect to faces faster than any other visual.`,
        takeaway: "Circle + 2 dots + curve = any human emotion. Position is everything.",
      },
      {
        id: "3b", title: "Stick Figures That Feel Alive",
        time: "25 min",
        body: `The secret: posture carries ALL the emotional weight.\n\n**Base structure:**\nCircle head → vertical line (spine) → horizontal line (shoulders) → arms → hip line → legs\n\n**Posture = Emotion:**\n- Straight spine, arms out = presenting / confident\n- Curved spine, arms in = tired / stressed\n- Leaning forward = curious / engaged\n- Arms raised = celebrating / excited\n- One hand on chin = thinking\n- Arms crossed = resistant / closed\n\n**Meeting sketchnotes:** Small figures at a table with varied postures tell the *social story* of the meeting — who was engaged, who was checked out.\n\n**Upgrade in 3 seconds:** Add a shirt rectangle on torso + 2 lines for hair. Done.`,
        takeaway: "Posture tells the story. A leaning figure is worth 100 words.",
      },
      {
        id: "3c", title: "Diverse Characters Quickly",
        time: "20 min",
        body: `Representation matters in sketchnotes — especially for social media and team settings.\n\n**Quick variation toolkit:**\n- **Hair:** Cloud/afro, straight lines down, short spikes, bun circle, hijab curve, cap rectangle\n- **Face:** Vary nose (dot vs. curve), glasses (two circles), beard (scribble jaw)\n- **Body:** Vary shoulder/hip width ratios\n- **Accessories:** Tie, scarf, earrings (small dots)\n\n**The 30-second character menu:**\nDevelop 6 distinct "characters" you can draw automatically — a full team. Use them consistently in work meeting notes so people become *characters in your story*, not just names on a page.\n\n**Social media tip:** Diverse, relatable characters make sketchnotes shareable across wider audiences. Representation is also just good design.`,
        takeaway: "6 auto-characters = a cast for every story you sketchnote.",
      },
    ],
    quiz: {
      title: "Module 3 Check-In",
      qs: [
        {
          q: "In a work meeting sketchnote, varied stick figure postures tell you:",
          opts: [
            "How long the meeting lasted",
            "The social energy — who was engaged, resistant, or tired",
            "The number of people attending",
            "Nothing useful — stick figures are decorative",
          ],
          ans: 1,
          explain: "Posture is body language data. A sketchnote that captures postures tells the *social story* of a meeting alongside the content — extremely valuable for retrospectives.",
        },
        {
          q: "To make a face look 'curious', you would:",
          opts: [
            "Draw a straight horizontal line mouth",
            "Move the eyes to the top third and add raised brows",
            "Make the circle head very large",
            "Remove the mouth entirely",
          ],
          ans: 1,
          explain: "Eyes high + raised brows = wide-eyed curiosity. Expression is about placement and proportion, not artistic detail.",
        },
        {
          q: "For a social media sketchnote, why include diverse characters?",
          opts: [
            "It takes more time so it shows effort",
            "It makes sketchnotes relatable to wider audiences and is good inclusive design",
            "Diverse characters are easier to draw",
            "Social platforms require it",
          ],
          ans: 1,
          explain: "Representation broadens who sees themselves in your content. It's good design ethics AND makes your work more widely shareable.",
        },
      ],
    },
    project: {
      title: "Cast Your Meeting",
      goal: "Work meetings",
      desc: "Attend your next real work meeting. For each person speaking, draw a quick stick figure with a posture that matches their energy. Capture the social dynamics as much as the content. Who was excited? Who was skeptical? Who checked out?",
      deliverable: "One meeting sketchnote where the *people* are as prominent as the ideas. Compare it to a previous meeting note — what new information does it contain?",
      tips: ["Draw figures small (2–3cm) so you can fit many", "Assign each person a unique hairstyle as their 'identifier'", "Use speech bubbles next to figures for key quotes"],
    },
  },
  {
    id: 4,
    emoji: "🗺️",
    title: "Layouts & Composition",
    subtitle: "Plan the page so ideas flow without thinking",
    duration: "Weeks 7–8",
    hoursNeeded: "7–9 hrs",
    relevance: ["Work meetings", "Learning & studying", "Social media"],
    accent: "#60A5FA",
    lessons: [
      {
        id: "4a", title: "6 Layout Patterns",
        time: "30 min",
        body: `Choose your layout BEFORE you write a single word. It's your map.\n\n**For work meetings:**\n- **Columns (2–3):** Agenda items as columns — perfect for structured meetings\n- **Radial:** Central topic + branches — great for brainstorms\n- **Linear:** Straight top-to-bottom — best for presentations with clear structure\n\n**For journaling:**\n- **Path/Road:** Winding narrative through the day's events\n- **Popcorn:** Scattered clusters — captures non-linear emotional days\n\n**For studying:**\n- **Skyscraper:** Tall single column — mirrors a chapter structure\n- **Radial:** Concept map for understanding relationships\n\n**For social media:**\n- **Radial or Columns** photograph best — they have visual symmetry and a clear center.`,
        takeaway: "Spend 30 seconds choosing a layout. It prevents every cramped-corner problem.",
      },
      {
        id: "4b", title: "The Grid & Visual Balance",
        time: "25 min",
        body: `You don't need perfect balance — you need *intentional* balance.\n\n**The Rule of Thirds (adapted for sketchnotes):**\nDivide your page into 3 columns and 3 rows (lightly in pencil). Place your most important visual at an intersection point. This is where the eye naturally lands first.\n\n**White space is not wasted space:**\nLeave intentional breathing room. A packed page = anxiety. A breathable page = clarity.\n\n**The 3-Zone Rule for social media sketchnotes:**\n- Top zone: Title/hook (big, bold — stop the scroll)\n- Middle zone: Core content (the knowledge)\n- Bottom zone: Takeaway + your signature/handle\n\nThis structure works for Instagram carousels, Pinterest pins, and LinkedIn posts.`,
        takeaway: "Rule of Thirds + 3-Zone = a page that's also a well-designed post.",
      },
      {
        id: "4c", title: "Color That Means Something",
        time: "20 min",
        body: `The 3-Color Rule — break it and regret it:\n\n1. **Black** — all linework and body text\n2. **Accent 1** — titles, key concepts (warm: orange/red = energy, action)\n3. **Accent 2** — secondary highlights (cool: blue/teal = process, calm)\n\n**Add color LAST** — after finishing everything in black.\n\n**Color with purpose:**\n- Same color = same category (color-code meeting agenda items)\n- Yellow highlight = "this is the key stat"\n- Red = risk, warning, action required\n\n**For journaling:** Choose a personal palette. Use the same 3 colors consistently across all journal entries — it creates visual continuity when you flip through your notebook.\n\n**For social media:** Warm orange/earth tones currently perform well for sketchnote content. But your consistent palette = your visual brand.`,
        takeaway: "3 colors max. Color last. Same color = same category.",
      },
    ],
    quiz: {
      title: "Module 4 Check-In",
      qs: [
        {
          q: "You're about to sketchnote a brainstorm session with one central idea and many offshoots. Best layout?",
          opts: ["Linear (top to bottom)", "Radial (center + branches)", "Skyscraper (tall column)", "Popcorn (scattered)"],
          ans: 1,
          explain: "Radial layouts visually mirror the structure of a brainstorm — one hub, many spokes. It makes relationships between the central idea and sub-ideas instantly clear.",
        },
        {
          q: "For a social media sketchnote, the TOP ZONE should contain:",
          opts: [
            "The most detailed information",
            "Your signature and social handles",
            "A bold title or hook that stops the scroll",
            "Color fills only — no text",
          ],
          ans: 2,
          explain: "You have ~0.5 seconds to earn a scroll-stopper. A big, bold title or provocative question at the top is your hook. Details come after.",
        },
        {
          q: "When should you add color to your sketchnote?",
          opts: [
            "Before writing, to set the mood",
            "While drawing, section by section",
            "After completing all linework and text",
            "Color is optional with no best timing",
          ],
          ans: 2,
          explain: "Coloring last lets you see the full composition before deciding what needs emphasis. You'll make better color choices and avoid over-coloring.",
        },
      ],
    },
    project: {
      title: "Layout Lab",
      goal: "Learning & studying",
      desc: "Take one chapter from a book you're reading (or a 15-minute YouTube tutorial). Sketchnote it THREE times using three different layouts: Linear, Radial, and Columns. Same content — different containers.",
      deliverable: "3 pages. Look at them side by side: which layout made the content easiest to understand? Which would look best on Instagram? Write your answer in your sketchbook.",
      tips: ["Lightly sketch the layout grid in pencil first", "Don't try to capture every word — 5 key ideas per layout", "Photograph all 3 pages with consistent lighting"],
    },
  },
  {
    id: 5,
    emoji: "⚡",
    title: "Live Capture & Speed",
    subtitle: "Keep up in real meetings and lectures",
    duration: "Weeks 9–10",
    hoursNeeded: "8–10 hrs",
    relevance: ["Work meetings", "Learning & studying"],
    accent: "#A78BFA",
    lessons: [
      {
        id: "5a", title: "The Listen → Distill → Draw Loop",
        time: "25 min",
        body: `Live sketchnoting is an information processing skill, not just a drawing skill.\n\n**The Loop (repeat every 20–30 seconds):**\n1. **LISTEN** — absorb a complete thought\n2. **DISTILL** — find the ONE idea worth capturing\n3. **DRAW** — commit it to paper quickly\n\n**What to capture:**\n- Keywords and stats (not full sentences)\n- Surprising or counterintuitive statements\n- Decisions made\n- Action items with owners\n- The speaker's clear excitement (it's a signal)\n\n**What to consciously skip:**\n- Repeated examples after you've got the point\n- Tangents the speaker themselves abandon\n- Administrative logistics (recur to calendar)\n\n**Meeting survival tip:** Put a small ★ next to anything you're unsure how to draw. Circle back at the end of the meeting to refine those sections.`,
        takeaway: "Listen first. Always. Drawing while listening loses both.",
      },
      {
        id: "5b", title: "Speed Techniques & Shorthand",
        time: "30 min",
        body: `Speed is muscle memory. You build it through deliberate repetition, not raw talent.\n\n**Build your visual shorthand:**\n- First letter in a circle: ©ompany, ®evenue, ©ustomer\n- Up/down arrows for increase/decrease\n- = for "equals" or "means"\n- → for "leads to"\n- ? for unknown/open question\n- !! for urgent\n- # for number\n\n**The 5-Minute Daily Drill:**\nSet a timer. Draw your 10 core icons as fast as possible. Add 1–2 new icons each week. After 6 weeks you'll have a 30-icon vocabulary that requires zero thinking.\n\n**Meeting shorthand upgrades:**\n- Draw a small diamond ◇ for "decision point"\n- Draw a flag 🏴 for "action item"\n- Draw a clock for "deadline mentioned"\n- Draw a $ for budget discussions`,
        takeaway: "5 minutes of daily icon drills beats 2-hour occasional sessions every time.",
      },
      {
        id: "5c", title: "Recovery & Adaptation",
        time: "20 min",
        body: `You WILL fall behind. Every sketchnoter does. Here's how to fall gracefully:\n\n**Recovery toolkit:**\n1. **Skip it** — leave blank space, move forward\n2. **Placeholder** — draw a box with a ? mark\n3. **Abbreviate** — first letter or simple arrow\n4. **Listen ahead** — speakers repeat important things\n5. **Grab a keyword** — even one word anchors the memory\n\n**The 70% Rule:**\nA sketchnote capturing 70% of ideas beautifully beats a complete transcript captured poorly. Your goal is *memorable*, not *exhaustive*.\n\n**After the meeting — 5 minutes:**\nReview your sketchnote while memory is fresh. Fill ? placeholders. Add color. Add any missing connections. This review doubles your retention compared to notes alone.\n\n**Study sketchnote tip:** Pause the video. It's OK. Use that freedom to be more deliberate than in live meetings.`,
        takeaway: "70% captured beautifully > 100% captured badly. Always.",
      },
    ],
    quiz: {
      title: "Module 5 Check-In",
      qs: [
        {
          q: "In the Listen → Distill → Draw loop, what is the DISTILL step?",
          opts: [
            "Drawing as fast as possible",
            "Identifying the single most important idea in what you just heard",
            "Writing a full sentence summary",
            "Choosing which color to use",
          ],
          ans: 1,
          explain: "Distilling is the cognitive core of sketchnoting. Before your pen touches paper, you must decide: 'of everything said, what is the ONE thing worth capturing?' This is what separates sketchnotes from transcripts.",
        },
        {
          q: "You're sketchnoting a meeting and the speaker moves faster than you can draw. You should:",
          opts: [
            "Abandon the sketchnote and take text notes",
            "Try to capture everything, even if it looks messy",
            "Leave a placeholder box with ? and keep moving forward",
            "Ask the speaker to slow down",
          ],
          ans: 2,
          explain: "Placeholders are professional tools, not admissions of failure. They keep your flow intact while flagging gaps to fill during the post-meeting 5-minute review.",
        },
        {
          q: "The BEST time to review and refine a live sketchnote is:",
          opts: [
            "The next morning when you're fresh",
            "Within 5 minutes after the meeting ends",
            "At the weekend when you have more time",
            "You shouldn't review — it's a live document",
          ],
          ans: 1,
          explain: "Memory is most accessible immediately after an event. A 5-minute post-meeting review while it's fresh doubles the value of your sketchnote. After an hour, many contextual details are gone.",
        },
      ],
    },
    project: {
      title: "The Live Capture Challenge",
      goal: "Work meetings",
      desc: "Your next real work meeting is your canvas. No pausing, no restarting. Sketchnote the entire thing live using everything from Modules 1–5. Set a 5-minute timer after the meeting to review and refine.",
      deliverable: "One complete live meeting sketchnote + your 5-minute refined version. Compare them — what changed? Share the refined version with one colleague and ask: 'Does this capture what happened?'",
      tips: ["Choose your layout in the first 30 seconds", "Use ★ for things you'll refine later", "Keep figures small — make room for ideas"],
    },
  },
  {
    id: 6,
    emoji: "🎨",
    title: "Style, Brand & Sharing",
    subtitle: "Develop a signature look and build your visual presence",
    duration: "Weeks 11–12",
    hoursNeeded: "6–8 hrs",
    relevance: ["Social media", "Journaling"],
    accent: "#FB923C",
    lessons: [
      {
        id: "6a", title: "Finding Your Visual Voice",
        time: "25 min",
        body: `Style isn't chosen — it emerges from consistent decisions made over time.\n\n**Your style variables to experiment with:**\n- **Line quality:** Tight + precise vs. loose + sketchy\n- **Icon style:** Rounded + friendly vs. angular + bold\n- **Lettering:** Neat all-caps vs. casual mixed-case\n- **Density:** Airy + spacious vs. rich + packed\n- **Color palette:** Warm earth tones vs. cool digital vs. monochrome\n\n**The comparison exercise:**\nFind 3 sketchnoters you admire (Sacha Chua, Doug Neill, Eva-Lotta Lammn are great starts). Write down what you love about each. Then draw the same icon 3 ways: their style, their style, your natural way. Notice where you naturally land.\n\n**Your style will emerge fastest by:**\n1. Drawing consistently (not just when inspired)\n2. Looking at your work over time and noticing what you keep doing\n3. Leaning INTO your instincts, not fighting them`,
        takeaway: "You don't create your style. You discover it through consistent practice.",
      },
      {
        id: "6b", title: "Sketchnoting for Social Media",
        time: "30 min",
        body: `Sketchnotes perform well on Instagram, Pinterest, and LinkedIn. Here's how to design for each:\n\n**Instagram (square or portrait):**\n- Bold title top-center (hook in 3 words or less)\n- Radial or 2-column layout\n- Warm, high-contrast colors\n- Your handle bottom-right as your signature\n- Stories: Use linear layout, 1 idea per screen\n\n**Pinterest (portrait 2:3 ratio):**\n- Even more vertical — skyscraper layout\n- Title at top, takeaway at bottom\n- Bright accent colors perform well\n\n**LinkedIn:**\n- More text-friendly audience\n- Annotate your sketchnote with 3 key bullet points in the caption\n- First comment strategy: expand on each point\n\n**General social tips:**\n- Photograph near a window (natural light, no flash)\n- Slight overhead angle (15°) avoids reflection\n- Consistent background (light desk or white paper beneath)\n- Post consistently: 1–2 sketchnotes/week beats irregular bursts`,
        takeaway: "Photograph near a window. Post consistently. Let your palette become your brand.",
      },
      {
        id: "6c", title: "Building a Sustainable Practice",
        time: "20 min",
        body: `The sketchnoter with consistent daily practice beats the talented occasional drawer every time.\n\n**Your sustainable weekly rhythm (for 3–5 hrs/week):**\n- **Mon/Wed/Fri:** 5-min icon drill (automatic — no decision needed)\n- **Tue or Thu:** Sketchnote one meeting at work (you're already there)\n- **Weekend:** 1 longer sketchnote — a book chapter, podcast, or journal entry\n- **Monthly:** One "portfolio piece" — polished, shared\n\n**Sketchnote anything:**\n- Podcasts during commute (voice memo your distillations first)\n- Your goals and quarterly review\n- Books: 1 page per chapter\n- Movies: plot + themes + your reaction\n- Recipes in your journal\n- TED talks (15–20 min = perfect practice length)\n\n**The "post before perfect" rule for social media:**\nSharing imperfect sketchnotes consistently > waiting for a perfect one. Audiences follow progress and authenticity, not polished portfolios.`,
        takeaway: "5-min drills + 1 meeting note + 1 weekend piece = a practice that compounds.",
      },
    ],
    quiz: {
      title: "Module 6 Check-In",
      qs: [
        {
          q: "Your visual style develops fastest by:",
          opts: [
            "Buying professional art supplies",
            "Copying one famous sketchnoter's exact style",
            "Drawing consistently and noticing your natural instincts over time",
            "Taking a formal illustration course",
          ],
          ans: 2,
          explain: "Style is discovered through repetition, not designed upfront. The more you draw, the more your natural tendencies emerge and solidify into a recognizable voice.",
        },
        {
          q: "The best way to photograph a sketchnote for Instagram is:",
          opts: [
            "Use your phone flash in a dark room",
            "Scan it with a flatbed scanner",
            "Photograph near a window in natural light at a slight overhead angle",
            "Use heavy filters to make colors pop",
          ],
          ans: 2,
          explain: "Natural window light is diffuse and flattering — it shows true colors without harsh shadows. Overhead angle (slight tilt) avoids paper glare.",
        },
        {
          q: "For 3–5 hours per week, the sustainable weekly rhythm is:",
          opts: [
            "One long 4-hour session on the weekend",
            "Daily 5-min drills + one meeting note + one weekend sketchnote",
            "Sketchnoting only when you feel inspired",
            "Only sketchnote when attending conferences",
          ],
          ans: 1,
          explain: "Short frequent sessions build muscle memory better than long infrequent ones. The mix of drills + applied practice + creative work covers all growth dimensions.",
        },
      ],
    },
    project: {
      title: "Your Signature Sketchnote",
      goal: "Social media",
      desc: "Create your best sketchnote yet — something deeply meaningful. Your goals for this year, a book that changed you, or a concept you want to teach others. Apply everything: your personal palette, your icon style, your lettering hierarchy, a strong layout.",
      deliverable: "One polished, colored sketchnote. Photograph it properly (window light). Post it to at least one platform with the caption explaining what you learned. Tag #sketchnotes. Sign your work.",
      tips: ["Rough sketch in pencil first", "Ink over pencil when satisfied", "Erase pencil fully before coloring", "Color last — resist the urge to color early"],
    },
  },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("home"); // home | module | lesson | quiz | project
  const [activeModIdx, setActiveModIdx] = useState(null);
  const [activeLesIdx, setActiveLesIdx] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [completed, setCompleted] = useState({ lessons: new Set(), quizzes: new Set(), projects: new Set() });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const mod = activeModIdx !== null ? curriculum[activeModIdx] : null;
  const les = activeLesIdx !== null && mod ? mod.lessons[activeLesIdx] : null;

  const totalLessons = curriculum.reduce((a, m) => a + m.lessons.length, 0);
  const totalItems = totalLessons + curriculum.length * 2; // + quizzes + projects
  const doneItems = completed.lessons.size + completed.quizzes.size + completed.projects.size;
  const progressPct = Math.round((doneItems / totalItems) * 100);

  function markDone(type, key) {
    setCompleted(prev => ({ ...prev, [type]: new Set([...prev[type], key]) }));
  }

  function openModule(mi) { setActiveModIdx(mi); setView("module"); }
  function openLesson(mi, li) { setActiveModIdx(mi); setActiveLesIdx(li); setView("lesson"); }
  function openQuiz(mi) { setActiveModIdx(mi); setQuizAnswers({}); setQuizSubmitted(false); setView("quiz"); }
  function openProject(mi) { setActiveModIdx(mi); setView("project"); }
  function goHome() { setView("home"); setActiveModIdx(null); setActiveLesIdx(null); }
  function goModule() { setView("module"); setActiveLesIdx(null); }

  const quizScore = mod ? mod.quiz.qs.reduce((s, q, i) => s + (quizAnswers[i] === q.ans ? 1 : 0), 0) : 0;

  // ── STYLES ──
  const S = {
    page: {
      minHeight: "100vh",
      background: "#F7F3EE",
      fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif",
      color: "#1a1208",
    },
    topBar: {
      background: "#1a1208",
      padding: "14px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
    },
    logo: { color: "#F7F3EE", fontSize: 18, fontWeight: "bold", letterSpacing: "0.05em" },
    progressChip: {
      background: "#ffffff15",
      borderRadius: 20,
      padding: "4px 14px",
      color: "#F7F3EE",
      fontSize: 13,
      display: "flex",
      alignItems: "center",
      gap: 10,
    },
    hero: {
      background: "#1a1208",
      padding: "60px 24px 50px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    },
    heroGrid: {
      position: "absolute", inset: 0,
      backgroundImage: "radial-gradient(circle, #ffffff08 1px, transparent 1px)",
      backgroundSize: "28px 28px",
    },
    container: { maxWidth: 1100, margin: "0 auto", padding: "0 20px" },
    profileBar: {
      display: "flex",
      flexWrap: "wrap",
      gap: 10,
      justifyContent: "center",
      marginTop: 28,
    },
    chip: (color) => ({
      background: color + "22",
      border: `1px solid ${color}55`,
      borderRadius: 20,
      padding: "5px 14px",
      fontSize: 13,
      color: color,
    }),
    modCard: (accent, done) => ({
      background: done ? "#fff" : "#fff",
      border: `1.5px solid ${done ? accent + "88" : "#e8e0d5"}`,
      borderRadius: 20,
      overflow: "hidden",
      marginBottom: 16,
      transition: "box-shadow 0.2s",
      cursor: "pointer",
      boxShadow: "0 2px 8px #0000000a",
    }),
    modHeader: (accent) => ({
      background: accent + "15",
      borderBottom: `1px solid ${accent}22`,
      padding: "18px 22px",
      display: "flex",
      alignItems: "center",
      gap: 14,
    }),
    btn: (bg, color = "#fff") => ({
      background: bg,
      border: "none",
      borderRadius: 10,
      padding: "10px 22px",
      color,
      fontSize: 14,
      fontFamily: "Palatino Linotype, Georgia, serif",
      cursor: "pointer",
      fontWeight: "bold",
      transition: "opacity 0.15s",
    }),
    backBtn: {
      background: "none",
      border: "1.5px solid #1a120833",
      borderRadius: 8,
      padding: "8px 16px",
      color: "#1a1208",
      fontSize: 13,
      fontFamily: "Palatino Linotype, Georgia, serif",
      cursor: "pointer",
      marginBottom: 24,
      display: "inline-block",
    },
    lessonRow: (done, accent) => ({
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "11px 14px",
      borderRadius: 12,
      background: done ? accent + "12" : "#f9f6f2",
      border: `1px solid ${done ? accent + "44" : "#e8e0d5"}`,
      marginBottom: 8,
      cursor: "pointer",
      transition: "all 0.15s",
    }),
  };

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (view === "home") return (
    <div style={S.page}>
      {/* Top Bar */}
      <div style={S.topBar}>
        <div style={S.logo}>✏️ Sketchnote Path</div>
        <div style={S.progressChip}>
          <div style={{ width: 80, height: 4, background: "#ffffff20", borderRadius: 2 }}>
            <div style={{ width: `${progressPct}%`, height: "100%", background: "#FBBF24", borderRadius: 2, transition: "width 0.6s" }} />
          </div>
          <span>{progressPct}% complete</span>
        </div>
      </div>

      {/* Hero */}
      <div style={S.hero}>
        <div style={S.heroGrid} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 13, color: "#FBBF24", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>Personalized for you</div>
          <h1 style={{ fontSize: 38, color: "#F7F3EE", fontWeight: "bold", margin: "0 0 10px", lineHeight: 1.15 }}>
            Your Sketchnoting<br />Curriculum
          </h1>
          <p style={{ color: "#9e9080", fontSize: 16, maxWidth: 420, margin: "0 auto 28px" }}>
            Tailored for a doodler with 3–5 hrs/week targeting meetings, journaling, studying & social media.
          </p>
          <div style={S.profileBar}>
            {[
              { label: "🎨 Doodler level", color: "#F472B6" },
              { label: "⏱ 3–5 hrs/week", color: "#60A5FA" },
              { label: "~12 weeks", color: "#34D399" },
              ...profile.goals.map((g, i) => ({ label: GOALS_META[g].icon + " " + g, color: Object.values(GOALS_META)[i % 4].color })),
            ].map((c, i) => <div key={i} style={S.chip(c.color)}>{c.label}</div>)}
          </div>
        </div>
      </div>

      {/* Modules */}
      <div style={{ ...S.container, padding: "36px 20px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: "bold" }}>6 Modules · 18 Lessons</h2>
          <span style={{ fontSize: 13, color: "#9e9080" }}>{doneItems}/{totalItems} items done</span>
        </div>

        {curriculum.map((m, mi) => {
          const lessDone = m.lessons.filter((_, li) => completed.lessons.has(`${mi}-${li}`)).length;
          const qDone = completed.quizzes.has(mi);
          const pDone = completed.projects.has(mi);
          const allDone = lessDone === m.lessons.length && qDone && pDone;
          return (
            <div key={m.id} style={S.modCard(m.accent, allDone)} onClick={() => openModule(mi)}>
              <div style={S.modHeader(m.accent)}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: m.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {m.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: m.accent, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 2 }}>
                    Module {m.id} · {m.duration} · {m.hoursNeeded}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: "bold" }}>{m.title}</div>
                  <div style={{ fontSize: 13, color: "#6b5c42", marginTop: 2 }}>{m.subtitle}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 22, fontWeight: "bold", color: allDone ? m.accent : "#1a1208" }}>
                    {allDone ? "✓" : `${lessDone}/${m.lessons.length}`}
                  </div>
                  <div style={{ fontSize: 11, color: "#9e9080" }}>lessons</div>
                </div>
              </div>
              {/* Relevance tags */}
              <div style={{ padding: "10px 22px", display: "flex", gap: 8, flexWrap: "wrap" }}>
                {m.relevance.map(r => (
                  <div key={r} style={{ background: GOALS_META[r].color + "18", border: `1px solid ${GOALS_META[r].color}33`, borderRadius: 20, padding: "3px 10px", fontSize: 12, color: GOALS_META[r].color }}>
                    {GOALS_META[r].icon} {r}
                  </div>
                ))}
                <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                  {qDone && <span style={{ fontSize: 11, color: "#34D399" }}>✓ Quiz</span>}
                  {pDone && <span style={{ fontSize: 11, color: "#34D399" }}>✓ Project</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── MODULE DETAIL ──────────────────────────────────────────────────────────
  if (view === "module" && mod) return (
    <div style={S.page}>
      <div style={S.topBar}>
        <div style={S.logo}>✏️ Sketchnote Path</div>
      </div>
      <div style={{ ...S.container, padding: "32px 20px" }}>
        <button style={S.backBtn} onClick={goHome}>← All Modules</button>
        {/* Module Header */}
        <div style={{ background: mod.accent + "18", border: `1.5px solid ${mod.accent}33`, borderRadius: 20, padding: "24px 28px", marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: mod.accent, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>
            Module {mod.id} · {mod.duration} · {mod.hoursNeeded}
          </div>
          <h2 style={{ fontSize: 26, fontWeight: "bold", margin: "0 0 6px" }}>{mod.emoji} {mod.title}</h2>
          <p style={{ margin: 0, color: "#6b5c42", fontSize: 15 }}>{mod.subtitle}</p>
        </div>

        {/* Lessons */}
        <h3 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 14, color: "#6b5c42", textTransform: "uppercase", letterSpacing: "0.1em" }}>Lessons</h3>
        {mod.lessons.map((l, li) => {
          const done = completed.lessons.has(`${activeModIdx}-${li}`);
          return (
            <div key={l.id} style={S.lessonRow(done, mod.accent)} onClick={() => openLesson(activeModIdx, li)}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: done ? mod.accent : "#e8e0d5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: done ? "#fff" : "#9e9080", fontWeight: "bold", flexShrink: 0 }}>
                {done ? "✓" : li + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: done ? "normal" : "bold" }}>{l.title}</div>
              </div>
              <div style={{ fontSize: 12, color: "#9e9080" }}>{l.time}</div>
              <div style={{ color: "#9e9080" }}>›</div>
            </div>
          );
        })}

        {/* Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 28 }}>
          <div
            onClick={() => openQuiz(activeModIdx)}
            style={{ background: completed.quizzes.has(activeModIdx) ? "#34D39918" : "#1a1208", border: `1.5px solid ${completed.quizzes.has(activeModIdx) ? "#34D399" : "#1a1208"}`, borderRadius: 14, padding: "20px", cursor: "pointer", textAlign: "center" }}
          >
            <div style={{ fontSize: 26, marginBottom: 6 }}>📝</div>
            <div style={{ fontSize: 15, fontWeight: "bold", color: completed.quizzes.has(activeModIdx) ? "#34D399" : "#F7F3EE" }}>
              {completed.quizzes.has(activeModIdx) ? "✓ Quiz Passed" : "Take the Quiz"}
            </div>
            <div style={{ fontSize: 12, color: completed.quizzes.has(activeModIdx) ? "#34D39988" : "#9e9080", marginTop: 4 }}>3 questions</div>
          </div>
          <div
            onClick={() => openProject(activeModIdx)}
            style={{ background: completed.projects.has(activeModIdx) ? "#34D39918" : mod.accent + "18", border: `1.5px solid ${completed.projects.has(activeModIdx) ? "#34D399" : mod.accent + "55"}`, borderRadius: 14, padding: "20px", cursor: "pointer", textAlign: "center" }}
          >
            <div style={{ fontSize: 26, marginBottom: 6 }}>🎯</div>
            <div style={{ fontSize: 15, fontWeight: "bold", color: completed.projects.has(activeModIdx) ? "#34D399" : "#1a1208" }}>
              {completed.projects.has(activeModIdx) ? "✓ Project Done" : "View Project"}
            </div>
            <div style={{ fontSize: 12, color: "#9e9080", marginTop: 4 }}>Hands-on</div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── LESSON ─────────────────────────────────────────────────────────────────
  if (view === "lesson" && les && mod) {
    const done = completed.lessons.has(`${activeModIdx}-${activeLesIdx}`);
    return (
      <div style={S.page}>
        <div style={S.topBar}>
          <div style={S.logo}>✏️ Sketchnote Path</div>
        </div>
        <div style={{ ...S.container, padding: "32px 20px" }}>
          <button style={S.backBtn} onClick={goModule}>← {mod.title}</button>
          <div style={{ background: "#fff", border: "1.5px solid #e8e0d5", borderRadius: 20, padding: "32px", boxShadow: "0 4px 20px #0000000a" }}>
            <div style={{ fontSize: 12, color: mod.accent, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>
              {mod.emoji} Module {mod.id} · Lesson {activeLesIdx + 1} · {les.time}
            </div>
            <h2 style={{ fontSize: 26, fontWeight: "bold", margin: "0 0 28px" }}>{les.title}</h2>
            <div style={{ fontSize: 16, lineHeight: 1.9, color: "#2d2010", whiteSpace: "pre-line" }}>
              {les.body.split('\n').map((line, i) => {
                const bold = line.replace(/\*\*(.+?)\*\*/g, (_, t) => `<strong>${t}</strong>`);
                return <p key={i} style={{ margin: "0 0 6px" }} dangerouslySetInnerHTML={{ __html: bold }} />;
              })}
            </div>
            <div style={{ marginTop: 32, background: mod.accent + "15", border: `1.5px solid ${mod.accent}44`, borderRadius: 14, padding: "18px 22px" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: mod.accent, marginBottom: 6 }}>💡 Key Takeaway</div>
              <div style={{ fontSize: 16, fontStyle: "italic", color: "#1a1208" }}>{les.takeaway}</div>
            </div>
            {!done ? (
              <button style={{ ...S.btn(mod.accent), marginTop: 24 }} onClick={() => { markDone("lessons", `${activeModIdx}-${activeLesIdx}`); goModule(); }}>
                ✓ Mark Lesson Complete
              </button>
            ) : (
              <div style={{ marginTop: 24, color: "#34D399", fontSize: 14, fontWeight: "bold" }}>✓ Lesson completed</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── QUIZ ───────────────────────────────────────────────────────────────────
  if (view === "quiz" && mod) {
    const allAnswered = Object.keys(quizAnswers).length === mod.quiz.qs.length;
    return (
      <div style={S.page}>
        <div style={S.topBar}><div style={S.logo}>✏️ Sketchnote Path</div></div>
        <div style={{ ...S.container, padding: "32px 20px" }}>
          <button style={S.backBtn} onClick={goModule}>← {mod.title}</button>
          <div style={{ background: "#fff", border: "1.5px solid #e8e0d5", borderRadius: 20, padding: "32px", boxShadow: "0 4px 20px #0000000a" }}>
            <div style={{ fontSize: 12, color: mod.accent, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>{mod.emoji} {mod.quiz.title}</div>
            <h2 style={{ fontSize: 24, fontWeight: "bold", margin: "0 0 28px" }}>Module {mod.id} Quiz</h2>

            {quizSubmitted && (
              <div style={{ background: quizScore === 3 ? "#34D39915" : "#FBBF2415", border: `1.5px solid ${quizScore === 3 ? "#34D399" : "#FBBF24"}`, borderRadius: 14, padding: "18px 22px", marginBottom: 28, textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 4 }}>{quizScore === 3 ? "🎉" : quizScore >= 2 ? "👍" : "📚"}</div>
                <div style={{ fontSize: 22, fontWeight: "bold" }}>{quizScore}/3 correct</div>
                <div style={{ color: "#6b5c42", marginTop: 4 }}>{quizScore === 3 ? "Perfect — on to the project!" : quizScore >= 2 ? "Strong. Read the explanations below." : "Review the lessons, then retry."}</div>
              </div>
            )}

            {mod.quiz.qs.map((q, qi) => (
              <div key={qi} style={{ marginBottom: 30 }}>
                <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 12, color: "#1a1208" }}>{qi + 1}. {q.q}</div>
                {q.opts.map((opt, ai) => {
                  let bg = "#f9f6f2", border = "#e8e0d5", color = "#1a1208";
                  if (quizSubmitted) {
                    if (ai === q.ans) { bg = "#34D39918"; border = "#34D399"; color = "#1a4a33"; }
                    else if (quizAnswers[qi] === ai) { bg = "#ef444418"; border = "#ef4444"; color = "#7f1d1d"; }
                  } else if (quizAnswers[qi] === ai) {
                    bg = mod.accent + "18"; border = mod.accent; color = "#1a1208";
                  }
                  return (
                    <div key={ai} onClick={() => !quizSubmitted && setQuizAnswers(p => ({ ...p, [qi]: ai }))}
                      style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 10, padding: "11px 16px", marginBottom: 8, cursor: quizSubmitted ? "default" : "pointer", color, transition: "all 0.15s", fontSize: 15 }}>
                      {opt}
                    </div>
                  );
                })}
                {quizSubmitted && <div style={{ fontSize: 13, color: "#6b5c42", marginTop: 8, padding: "10px 14px", background: "#f9f6f2", borderRadius: 8, fontStyle: "italic" }}>💬 {q.explain}</div>}
              </div>
            ))}

            {!quizSubmitted ? (
              <button style={{ ...S.btn("#1a1208"), opacity: allAnswered ? 1 : 0.4 }}
                onClick={() => { if (allAnswered) { setQuizSubmitted(true); markDone("quizzes", activeModIdx); } }}>
                Submit Answers
              </button>
            ) : (
              <div style={{ display: "flex", gap: 12 }}>
                <button style={S.btn("#6b5c42")} onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }}>Retry Quiz</button>
                <button style={S.btn(mod.accent)} onClick={() => openProject(activeModIdx)}>→ View Project</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── PROJECT ────────────────────────────────────────────────────────────────
  if (view === "project" && mod) {
    const done = completed.projects.has(activeModIdx);
    const goalMeta = GOALS_META[mod.project.goal] || {};
    return (
      <div style={S.page}>
        <div style={S.topBar}><div style={S.logo}>✏️ Sketchnote Path</div></div>
        <div style={{ ...S.container, padding: "32px 20px" }}>
          <button style={S.backBtn} onClick={goModule}>← {mod.title}</button>
          <div style={{ background: "#fff", border: "1.5px solid #e8e0d5", borderRadius: 20, padding: "32px", boxShadow: "0 4px 20px #0000000a" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: (goalMeta.color || mod.accent) + "18", border: `1px solid ${(goalMeta.color || mod.accent)}33`, borderRadius: 20, padding: "4px 14px", fontSize: 13, color: goalMeta.color || mod.accent, marginBottom: 16 }}>
              {goalMeta.icon} Aligned to: {mod.project.goal}
            </div>
            <h2 style={{ fontSize: 26, fontWeight: "bold", margin: "0 0 20px" }}>🎯 {mod.project.title}</h2>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: "#2d2010", marginBottom: 24 }}>{mod.project.desc}</p>

            <div style={{ background: "#f9f6f2", border: "1px solid #e8e0d5", borderRadius: 12, padding: "18px 22px", marginBottom: 20 }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "#9e9080", marginBottom: 8 }}>📦 Deliverable</div>
              <div style={{ fontSize: 15, fontStyle: "italic", color: "#1a1208", lineHeight: 1.7 }}>{mod.project.deliverable}</div>
            </div>

            <div style={{ background: mod.accent + "12", border: `1px solid ${mod.accent}33`, borderRadius: 12, padding: "18px 22px", marginBottom: 28 }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: mod.accent, marginBottom: 12 }}>💡 Tips</div>
              {mod.project.tips.map((t, i) => (
                <div key={i} style={{ fontSize: 15, color: "#2d2010", marginBottom: 8, paddingLeft: 4 }}>→ {t}</div>
              ))}
            </div>

            {!done ? (
              <button style={S.btn(mod.accent)} onClick={() => { markDone("projects", activeModIdx); goModule(); }}>
                ✓ Mark Project Complete
              </button>
            ) : (
              <div style={{ color: "#34D399", fontWeight: "bold", fontSize: 15 }}>✓ Project completed — great work!</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}