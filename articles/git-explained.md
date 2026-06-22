---
title: Git Explained
date: 2026-06-20
tag: dev
description: A practical, opinionated tour of Git on workflow, commands, and how to dig yourself out of the scary situations.
---

Git is a version control system. It's a history of every change you make to the codebase. You can revert code back to previous versions. Teammates work on the code by splitting the timeline into branches and then merging the branches back into one timeline.

- **GitHub:** the site that hosts git repositories.
    - **remote:** existing on GitHub.
    - **local:** existing on your computer.
- **branch:** a separate, parallel timeline where you build new features.
    - **main:** the production branch; the official code you're shipping to the world.


## Git workflow

1. **Stage.** Add files to include in your next commit. Each added file is captured as a snapshot at that moment. If you edit a file after staging, you must re-stage it.
2. **Commit.** Save your staged snapshot to your local branch's history.
3. **Push.** Update the remote branch to match your local branch.

```bash
git add .
git commit -m "<message>"
git push
```

When working on a new feature, you do not work on the main branch. You create a feature branch, code your feature, and merge the branch into main.

## Pull requests

After you push, you open a pull request. The push must be reviewed and approved before merging.

## Commit messages

The tense for commit messages is present imperative; they're written in the same tense as commands like `git pull` and `git merge`. The message says what the change *does* to the codebase, not what it *did*.

- `Fixed login button` is wrong.
- `Fix login button` is correct.

## Basic commands

This is all you need until you make a serious mistake.

- `git pull`
Download and merge latest commits from remote.
- `git push`
Send local commits to remote repo.
- `git add .`
Stage all files.
- `git reset`
Unstage all files.
- `git commit -m "<message>"`
Record staged changes.
- `git status`
Show current branch, staged files, unstaged files, and tracked files.
- `git switch <branch>`
Switch to a branch.
- `git switch -c <new-branch>`
Create and switch to a new branch.
- `git restore <file>`
Destroy unstaged changes.
- `git restore --staged <file>`
Unstage this file.

### What about git checkout?

Older Git users don't use switch or restore; they use `git checkout`. It's overloaded with 2 unrelated functions: deleting changes and switching branches. If you know this, excellent. If not, stick to switch and restore.

## Common problems

### Merge conflicts

A merge conflict is when 2 people edit the same line of code. The edits overlap and Git must pick one to take priority.

To resolve it, you either (1) accept the current, (2) accept the incoming, or (3) both. Accepting both literally concatenates the code for you to figure out later. Make the right decision by reading the code and asking your teammates why they made the edit.

## Destructive changes

These are *destructive* commands. Do you know what destructive means? It means you pull out a gun and shoot it in the head. These commands irreversibly delete work.

- `git clean -fd` 
Destroy all untracked files and directories from the working tree.
- `git push --force` 
Overwrite the remote repo's history with your local repo's history.

### Should I force push?

Git rejects the push if the local branch and the remote branch diverge in commit history. It causes `git error: failed to push some refs to`.

1. **Parallel commits.** Your teammate pushed to the remote branch, and now your local branch is behind. To fix, `git pull`.
2. **Rewritten history.** You rebased or amended a commit that was already pushed. This rewrites your local commit history, diverging it from the remote branch.
   - *If you're on a team*, `git push --force-with-lease`. This force pushes but rejects if someone else pushed ahead of you.
   - *If you're solo*, `git push --force`. This is dangerous for teams. If someone else pushed ahead of you, it overwrites their push.

### Rebasing

Merges make Git graphs look messy and illegible. You `git rebase <branch-name>` to make the graph linear. Rebasing makes the graph linear by plucking off a feature branch and then sticking it onto the latest commit. That's why it's called rebasing. It changes the base commit that the branch starts from. Never rebase without coordinating the team. After rebasing, you must force push.

### Amending exposed secrets in Git

**Staged, not committed**

1. `git reset HEAD <file>`
2. Remove the secret.

**Committed, not pushed**

1. Remove the secret.
2. `git add <file>`
3. `git commit --amend` — this rewrites the last commit. It's a do-over.

**Pushed**

1. Rotate the secret immediately.
2. Remove the secret, commit, and push.

### Purging sensitive files from Git

Git history is permanent. Deleted files remain in all prior commits. If sensitive files are committed, those files can be purged from history.

*Warning: this rewrites history. It cannot be undone.*

1. Rotate exposed secrets immediately.
2. Add the file to `.gitignore`: `echo "<filename>/" >> .gitignore`
3. Stop tracking the file: `git rm -r --cached <filename>`
4. Commit: `git commit -m "stop tracking <filename>"`
5. Clean the file out of history with [git-filter-repo](https://github.com/newren/git-filter-repo), a Python tool: `git filter-repo --sensitive-data-removal --invert-paths --path <filename>`
6. Force push. Teammates must re-clone after the force push: `git push --force`

## Can AI run Git commands?

Yes, but I don't allow AI to run destructive Git commands.

I ask Claude to refresh me on commands, but ultimately, I'm the one who enters them. This guards against blindly approving a series of Git operations when I'm too tired or time-pressed.

I once asked Claude if `git clean -fd` could delete all untracked files except one of them. Claude saved a copy of that file as an untracked backup file and deleted all untracked files, including the backup.