# WorkStack User Guide

Welcome to **WorkStack**, your all-in-one platform for project management and version control. This guide will help you get started with managing your code repositories and tracking project tasks.

---

## 1. Account Setup

### Registration
1.  Navigate to the **Register** page.
2.  Enter your **Email**, **First Name**, and **Last Name**.
3.  Click **Register**.
4.  You will receive an email with your **Temporary Password**.
    *   *Note: Check your spam folder if you don't see it immediately.*

### First Login
1.  Go to the **Login** page.
2.  Enter your email and the temporary password.
3.  You will be prompted to **Change Your Password**.
4.  Enter a new, secure password to access your dashboard.

---

## 2. Managing Repositories

### Creating a Repository
1.  On the **Dashboard**, click the **"+ New Repository"** button.
2.  Enter a **Repository Name** (e.g., `MyProject`).
3.  Add a description (optional) and choose visibility (Public/Private).
4.  Click **Create Repository**.
5.  You will be redirected to your new repository page.

### Cloning a Repository
1.  Open your repository page.
2.  Click the **"Clone"** button in the top right.
3.  Click the copy icon to copy the **HTTPS URL**.
    *   Example: `https://workstak-production.up.railway.app/git/MyProject.git`

---

## 3. Git Workflow Guide

This section explains how to use Git with WorkStack from your terminal.

### Prerequisites
*   **Git Installed:** Ensure Git is installed on your computer (`git --version`).
*   **Terminal:** Use Terminal (Mac/Linux) or PowerShell/Git Bash (Windows).

### Step 1: Initial Setup (Global)
Configure Git with your name and email if you haven't already.
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 2: Push an Existing Local Project
If you already have code on your computer and want to upload it to WorkStack:

1.  **Initialize Git** (if not already done):
    ```bash
    cd /path/to/your/project
    git init
    ```

2.  **Add Your Files:**
    ```bash
    git add .
    git commit -m "Initial commit"
    ```

3.  **Link to WorkStack:**
    Replace `<REPO_URL>` with the URL you copied from the "Clone" button.
    ```bash
    git remote add origin <REPO_URL>
    ```

4.  **Push to Master:**
    ```bash
    git branch -M master
    git push -u origin master
    ```
    *   **Password Prompt:** Enter your WorkStack email (username) and password when prompted.

### Step 3: Cloning a New Project
If you are starting fresh or joining a team:

```bash
git clone <REPO_URL>
cd <RepoName>
```

### Step 4: Daily Workflow (Branch, Commit, Push)
**Never work directly on `master`.** Always use feature branches.

1.  **Create a Branch:**
    ```bash
    git checkout -b feature/my-new-feature
    ```

2.  **Make Changes:** Edit files in your editor.

3.  **Save Changes:**
    ```bash
    git status          # Check what changed
    git add .           # Stage all changes
    git commit -m "Add login page"
    ```

4.  **Push Your Branch:**
    ```bash
    git push -u origin feature/my-new-feature
    ```

### Step 5: Pull Requests (PR)
Once your code is pushed:
1.  Go to the **WorkStack Web Interface**.
2.  Navigate to your repository -> **Pull Requests**.
3.  Click **"New Pull Request"**.
4.  Select your branch (`feature/my-new-feature`) as Source and `master` as Target.
5.  Review the changes and click **Create PR**.
6.  Once approved, click **Merge** on the PR page to update `master`.

---

## 4. Troubleshooting

**Q: I get "Authentication failed" when pushing.**
*   **A:** Ensure you are using your **WorkStack Login Email** and **Password**. If you enabled 2FA (future feature) or use SSO, you might need a token. For now, use your raw password.
*   **Tip:** macOS/Windows often cache old passwords.
    *   **Mac:** Open "Keychain Access", search for your domain, and delete the entry to re-enter credentials.
    *   **Windows:** Open "Credential Manager", find the entry, and update/remove it.

**Q: I get "502 Bad Gateway" or "RPC failed".**
*   **A:** This usually means a server misconfiguration or a very large push. Check your internet connection. If persistent, contact the administrator.

**Q: I can't merge my PR.**
*   **A:** Ensure there are no **Merge Conflicts**. If verification fails, pull `master` into your feature branch locally (`git pull origin master`), resolve conflicts, and push again.

