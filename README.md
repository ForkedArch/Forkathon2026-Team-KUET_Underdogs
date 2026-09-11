<img src="https://i.ibb.co.com/7NrtB6Vv/image.png" />

# Forkathon 2026: KUET CAMPUS SPACE MANAGEMENT by KUET_Underdogs

> Built for ForkedArch Freshers Hackathon 2026

## 👥 Team

| Name     | Roll     | Department | GitHub    |
| -------- | -------- | ---------- | --------- |
| Nazmus Sadat | 2507024 | CSE        | @NazmusSadat0 |
| Adil Mahmud Ayon | 2507103 | CSE        | @adilmahmudayon-hue |
| Mitaly Farzana | 2507091 | CSE        | @mitalyoyshe |
| Antora Ghosh | 2507097 | CSE        | @agantoraghosh-prog |

---

## ❔ Problem

### Problem Statement

The Empty Room

A classroom is empty for three hours every afternoon. Somewhere else, a group of students is desperately looking for a place to work. A laboratory is available, but nobody knows whether they are allowed to use it. A meeting room has been reserved but nobody actually shows up.

There is space everywhere—but somehow, nobody can find it when they need it.

What an absolute mess!
KUET needs this problem to be solutioned soon.

Maybe a digital solution for this that will be able to solve this?
The system could deal with classrooms, study spaces, meeting rooms, labs, sports facilities, community spaces, or even resources outside a campus.
Probably a system where you can know the availability, booking, conflicts, cancellations, usage, permissions, and fairness.

Brainstorming twist: Don't assume that "available" simply means "empty." What makes a space genuinely usable?


### 🤔 KUET_Underdogs' Understanding

Finding a place to work should not be harder than the work itself. But a group of students might spend time asking around for a room while another classroom sits empty nearby. Even after finding one, they may not know whether they are allowed to use it, where to collect the key or whether another group has already booked it.

We understood that the problem is not just a lack of space. It is a lack of clear information and a shared booking process.

These are the main problems we identified:

1. **Finding a space:** Students do not have one place to check which rooms they could use.
2. **Knowing the available time:** A room might be free now, but needed for a class shortly afterwards.
3. **Understanding permissions:** An empty lab does not necessarily mean anyone can use it. Some spaces need approval or supervision.
4. **Requesting a booking:** Students have to ask around or visit an office instead of following a clear process.
5. **Avoiding conflicting bookings:** Different groups may request the same room for overlapping times.
6. **Dealing with no-shows:** A reservation can block others even when the group never arrives.
7. **Sharing cancellations:** When someone cancels, other students may not know that the slot has opened up.
8. **Checking facilities:** Students need to know whether a room has enough seats and the equipment their activity requires.
9. **Getting access:** A booking is not very useful if students do not know how to enter the room or whom to contact.
10. **Keeping access fair:** A few users could repeatedly book popular spaces. We identified this concern but kept advanced fairness controls outside our current scope.
11. **Keeping records:** Without a shared booking history, it is difficult for the admin to track requests, decisions and cancellations.

For us, a usable space is more than an empty room. It needs to be suitable for the activity, available for the required time and accessible to the students requesting it.

---

## 💡 Our Solution

### Overview

We built Empty Room to make finding and booking a space at KUET less confusing. Instead of asking around or visiting the department office, students can check room facilities, send a booking request and follow its status from one place.

The system covers classrooms, study spaces, meeting rooms, laboratories and sports facilities. It also shows capacity, equipment and any listed access requirements, because an empty room is not always a room someone can use.

## 🌐 Live Website

Visit Empty Room : https://empty-room-iota.vercel.app



### How It Works

1. Students create an account and log in. Their dashboard shows their pending, upcoming and cancelled bookings, along with their booking history.

2. Before requesting a space, students can visit the Facilities page to check what each room offers. They then choose a room, date, time, purpose and participant count on the booking page.

3. Once submitted, the request appears as pending on the student’s dashboard and in the admin’s Requests section.

4. The admin reviews the request and can consult the Booked Rooms schedule, filtering by date and time. The database prevents approval if another approved or checked-in booking overlaps the requested slot.

5. The admin approves the request or rejects it with a reason. The student’s dashboard updates to show the decision and, if rejected, the reason.

6. Students can cancel a booking before it starts, releasing the reserved slot. The admin can use the schedule and booking history to keep track of reservations.

---

## 🏗️ Architecture


<p align="center">
  <img src="./assets/mermaid-diagram.png"
       alt="KUET Space Management System Workflow"
       width="100%">
</p>

<b>Forkathon: Freshers Hackathon 2026 presented by ForkedArch powered by XtendArena</b>
