# Job Tracker - User Manual & Feature Guide

This guide explains how to use the newly added features in the Job Tracker dashboard.

## 🎯 Smart Filtering & Sorting

We have overhauled the job list to give you more control over finding the right applications.

### 1. accessing Filters
-   Click the **"Filters"** button (next to the Sort button).
-   A popup menu will appear with the following options:

#### 📍 Location Filter
-   Type a city or country name in the **"Location"** input field.
-   The list will automatically update to show jobs matching that location (e.g., "New York", "Remote").

#### 💰 Salary Range
-   Enter a **Min** and/or **Max** salary in the inputs.
-   The list will filter to show jobs that overlap with your desired range.

#### 📊 Status Filter
-   Select a specific status (e.g., "Interview", "Applied") from the list.
-   Click "All Statuses" to reset.

### 2. Advanced Sorting
-   Click the **Sort Button** (defaults to "Newest First").
-   New options available:
    -   **Location (A-Z)**: Group jobs by city alphabetically.
    -   **Location (Z-A)**: Reverse alphabetical order.
    -   **Highest Salary**: See the best-paying roles first.

---

## 🛠 Troubleshooting

### "I don't see any jobs!"
1.  Check if you have active filters. The **Filters** button will show a small `!` badge if filters are active.
2.  Click **"Clear filters"** next to the results count to reset everything.

### "Database Connection Error"
If you see an error about `db.prisma.io`, your application is trying to connect to a remote database that is unreachable.
-   **Fix**: Update your `.env` file with a valid local PostgreSQL URL or a working cloud database connection string.
