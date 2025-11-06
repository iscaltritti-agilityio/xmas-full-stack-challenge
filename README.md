# 🎄 Christmas Workshop Full Stack Challenge

**From:** Jingleberry Sparkletoes, Senior Toy Production Engineer (127 years of service)

**To:** You (our last hope)

**Subject:** URGENT - Workshop System Crisis & Possible Career-Ending Situation

Dear Friend,

If you're reading this, congratulations! You've been **selected** to help save Christmas (and my job, and possibly my life).

I've been building wooden trains for over a century, and let me tell you, I've seen things. But nothing prepared me for the disaster that is our new workshop management system. Some junior elf thought they could "modernize" our processes, and now everything is broken.

**AI Usage Fully Encouraged** - Listen, us elves use all sorts of magical artifacts to get work done. Use whatever tools you would use to take care of the job in a real-world scenario.

## 🎅 Starting the Workshop

Choose your backend technology; both provide identical challenge.

⚠️ **Stick to `npm` and the latest stable version of Node!**

### React Frontend & Node Backend (preferred)

From root, execute:

```bash
npm run setup
npm start
```

### React Frontend & Python Backend

From root, execute:

```bash
npm run setup:python
npm run start:python
```

## 🐛 Objective 1: Workshop Cleanup

Our workshop code has some... issues. Santa's not happy.

- **B-1**: Edit Elf Profile's service date validation is acting strange
- **B-2**: Dragging and dropping toys between production stages stopped working and I have 47 wooden trains in the Quality Check column that need to show as "Ready to Deliver" before the end of the day or Santa will reassign me to coal mining duty in the Sub-Basement. The Sub-Basement doesn't have windows. Or oxygen. It's not great.

## 🎯 Objective 2: Holiday Feature

After fixing the bugs above, the people watching you code right now (I know they're there) will select one of the following features for you to implement.

### F-1: 🏃 Real-Time Toy Order Updates

Keep multiple workshop terminals in sync so elves can collaborate in real time.

**Requirements:**
- Changes appear instantly in all browser tabs with no refresh needed when following these steps:
    1. Open two browser instances or tabs side-by-side
    2. Drag a toy to a different status column in one tab
    3. Watch it update immediately in the other tab
- **Bonus:** Visual indicator showing when another elf makes a change

### F-2: ↩️ Undo System

Mrs. Claus keeps accidentally reassigning toys (she's practically blind) and wants to be able to undo her mistakes.

**Requirements:**
- Implement an undo feature for toy order changes
- Users should understand what they're undoing before they do it
- The system should handle edge cases gracefully (nothing to undo, etc.)
- **You decide:** How many levels of undo? What operations can be undone? How is history stored?

---

Please help. I have a family. Well, not really, elves don't reproduce, we just sort of... appear.

But I have friends! And hobbies! I don't want to mine coal!

Desperately yours,

**Jingleberry Sparkletoes** 🎄

*Senior Toy Production Engineer*

*Wooden Train Specialist (127 years)*

*Employee ID: ELF-001*

*Current Status: Panicking*

