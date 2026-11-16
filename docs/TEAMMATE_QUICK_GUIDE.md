# Quick & Simple Guide to Our DBMS Project
### (Easy Guide for Team Members - No Heavy Jargon)

---

## 1. What is our project in ONE simple sentence?
> **It is a website and database used by a cybersecurity team (SOC) to record cyber attacks, calculate how dangerous they are, and use smart search to find past similar attacks.**

---

## 2. Why did we build this? (The Real-World Story)
Imagine a big company like a bank or college:
* Hackers constantly try to attack their servers, databases, and computers (with ransomware, phishing emails, or password theft).
* Security engineers have to handle hundreds of alerts every day.
* **Without a system:** It is total chaos. Nobody knows who is fixing what, and they forget if the same attack happened last month.
* **With our system:** Whenever an attack happens, an engineer logs it. The system automatically calculates the danger level, keeps an unchangeable diary of every action, and lets anyone search past attacks using smart meaning-based search.

---

## 3. The 3 Main Parts of the Project

| Part | What it is | In simple words |
| :--- | :--- | :--- |
| **1. Relational Database** | PostgreSQL 15 | Like organized Excel sheets that connect to each other (Users, Computers/Servers, Incidents, Actions, and Logs). |
| **2. Smart Search (Vector DB)** | `pgvector` | A special tool that understands the **meaning** of words. If you type *"stolen passwords"*, it finds attacks that mention *"credential theft"* even if the words are different. |
| **3. Web Interface** | Next.js | The website where we click, log incidents, and view graphs in the browser. |

---

## 4. How to Log In & Our 2 Roles

We have **2 roles** (this is an important exam requirement called **RBAC**):

1. **Administrator (Admin):**
   * **Username:** `admin`
   * **Password:** `admin`
   * **What they do:** The boss. They can see company hierarchy trees and system-wide audit logs.

2. **Security Analyst:**
   * **Username:** `analyst`
   * **Password:** `analyst`
   * **What they do:** The security investigator. They log new attacks, investigate them, and run searches.

*(Website link: `http://localhost:3000/login`)*

---

## 5. Website Tour (What each page does)

* **1. Dashboard (`/dashboard`):**  
  Shows big KPI numbers (Total Attacks, Critical Attacks, Total Servers protected) and a priority list of urgent threats.
* **2. Log an Incident (`/incidents/new`):**  
  A simple form to report an attack. When you pick how serious it is, the database automatically calculates a **Risk Score** from 1 to 10.
* **3. Incident Details (`/incidents/1`):**  
  Shows everything about one attack: what happened, which server was hit, who is investigating, and an automatic timeline of every change.
* **4. Smart Search (`/search`):**  
  **The coolest feature in the project!** You can type any sentence (like *"database hack"* or *"ransomware locked files"*), and it instantly finds similar past attacks and tells you how similar they are (e.g. 95% match).
* **5. Reports (`/reports`):**  
  Shows how busy each analyst is (so work can be shared fairly) and how fast the team resolves problems.
* **6. Admin Portal (`/admin`):**  
  Shows the company reporting tree (Boss $\rightarrow$ Team Lead $\rightarrow$ Analysts).

---

## 6. The 4 Big DBMS Concepts the Teacher Will Ask You

When the teacher asks about the database, here are the 4 main things to remember:

### A. "What is your Stored Function?"
* **Simple Answer:**  
  *"It is a formula saved inside the database that calculates the Risk Score of an attack. It takes the attack severity, how important the target server is, and the attack type, and calculates a score between 1 and 10."*

### B. "What is your Trigger?"
* **Simple Answer:**  
  *"It is an automatic robot inside the database. Whenever someone changes an incident's status (for example from 'Open' to 'Resolved'), the trigger immediately writes a permanent row into the `audit_logs` table with who changed it and the exact time."*

### C. "Why did you use pgvector instead of a separate vector database?"
* **Simple Answer:**  
  *"If we used a separate vector database, our normal data would be in one place and our vectors in another, which can cause sync errors. `pgvector` lets us keep regular tables and smart vectors together in one PostgreSQL database."*

### D. "What is your Recursive CTE?"
* **Simple Answer:**  
  *"It is a query that loops through the employees table to draw the management family tree: Sarah Connor is at the top, Alex Rivera reports to her, and the analysts report to Alex."*

---

## 7. Quick Cheat Sheet for Viva
If the teacher asks:
* *"Where is the data stored?"* $\rightarrow$ **PostgreSQL 15** running locally on port 5432.
* *"How many tables do you have?"* $\rightarrow$ **11 tables** (Users, Roles, Assets, Incidents, Evidence, Responses, Audit Logs, etc.).
* *"Is it normalized?"* $\rightarrow$ Yes, it is in **3rd Normal Form (3NF)** so there is no duplicate data.
* *"How does the smart search work?"* $\rightarrow$ An AI model turns text into **384 numbers** (a vector), and PostgreSQL finds the closest matching vectors using **Cosine Distance**.
