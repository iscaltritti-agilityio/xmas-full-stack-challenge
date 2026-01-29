# 🎄 Christmas Workshop Full Stack Challenge

**From:** Jingleberry Sparkletoes, Senior Toy Production Engineer (127 years of service)

**To:** You (our last hope)

**Subject:** URGENT - Workshop System Crisis & Possible Career-Ending Situation

Dear Friend,

If you're reading this, congratulations! You've been **selected** to help save Christmas (and my job, and possibly my life).

I've been building wooden trains for over a century, and let me tell you, I've seen things. But nothing prepared me for the disaster that is our new workshop management system. Some junior elf thought they could "modernize" our processes, and now everything is broken.

**AI Usage Fully Encouraged** - Us elves use all sorts of magical artifacts to get work done. Use whatever tools you would use to take care of the job in a real-world scenario.

## 🎅 Starting the Workshop

⚠️ **Requirements:** Use `npm` and Node version 18 or higher.

### React Frontend & Node Backend

From root (`./`), execute:

```bash
npm run setup
npm start
```

### React Frontend & Python Backend

From root (`./`), execute:

```bash
npm run setup:python
npm run start:python
```

## 🐛 Objective 1: Workshop Cleanup

Our workshop code has some... issues. Santa's not happy.

- **B-1**: Edit Elf Profile's service date validation is acting strange
- **B-2**: Dragging and dropping toys between production stages stopped working; I have 47 wooden trains in the Quality Check column that need to show as "Ready to Deliver" before the end of the day or Santa will reassign me to coal mining duty in the sub-basement. The sub-basement doesn't have windows. Or oxygen. It's not great.

## 🎯 Objective 2: Holiday Feature

After fixing the bugs above, the people watching (I know they're there 👀) will select one of the following features for you to implement.

### F-1: Instant Updates

Keep multiple workshop terminals in sync so elves can collaborate in real time.

**Acceptance Criteria:**
- Toy order updates are displayed instantly in all instances of the application
  1. Open two application instances side-by-side
  2. Transition a toy order from one stage to another
  3. Update is displayed instantly in the inactive instance

### F-2: Undo System

Mrs. Claus keeps accidentally reassigning toys (she's practically blind) and wants to be able to undo her mistakes.

**Acceptance Criteria:**
- Users can undo toy order updates
- The interface displays what would be undone before undoing
Note: **You decide how many levels of undo, and type of updates can be undone**

**Before you start coding:**

Explain your approach. What solution would you implement, and why?

After the explaining, your interviewer may choose to constrain you to one of the preset solutions below to evaluate adaptability.
- [PS-A](https://gist.github.com/iscaltritti-agilityio/b3d23a1805988b1bc2a82f917930eaee)
- [PS-B](https://gist.github.com/iscaltritti-agilityio/63585d693845e5533400a402be47e945)

---

Please help. I have a family. Well, not really, elves don't reproduce, we just sort of... appear.

But I have friends! And hobbies! I don't want to mine coal!

Desperately yours,

**Jingleberry Sparkletoes** 🎄

*Senior Toy Production Engineer*

*Wooden Train Specialist (127 years)*

*Employee ID: ELF-001*

*Current Status: Panicking*

