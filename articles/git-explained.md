---
title: Git explained
date: 2026-06-20
tag: dev
description: A practical tour of Git on workflow, commands, and how to dig yourself out of scary situations.
---

Git is a version control system. It's a history of every change you make to the codebase. You can revert code to previous versions. Teammates work on the code by splitting the timeline into branches and then merging the branches back into one timeline.

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

After you push, you open a pull request (PR), an official request to merge your changes into main.

When a PR is opened, a code review must be done by a teammate or project owner. The reviewer will check the PR for mistakes you didn't see the first time. If your code is good, they will *merge* it. If your code has issues, they will *request changes* and provide feedback for you to fix it.

### Nit

Your feedback will often have *nits*. A nit is a suggestion to fix a minor issue that doesn't affect functionality. It's usually a typo, naming, or style issue.

Examples include:
```
nit: rename `t` to `total`
nit: unused variable on line 12
nit: project uses single quotes, not double quotes
```

You don't have to fix nits, but it's worth considering because it teaches you good coding habits. A nit is how a senior dev politely tells you, "Hey, I noticed this. Here's a better way, but it's your call." Nits are also signals about what makes code legible to your team. Skip nits during crunch time.

## Commit messages

A commit message is a short description of the change you made to the code. Every commit should be an atomic change, even if it's just one line. Don't overload a commit with multiple features.

`Fix homepage typo` is a clear commit message. But if you fix three bugs, add dark mode, and refactor the navbar in one commit, there's no way to encapsulate that in a single message. It makes pull requests too complex to review.

### Commit style

Commit messages are written in the imperative mood; they use the same form as commands like `git pull` and `git merge`. The message says what the change *does* to the codebase, not what it *did*.

1. `Added login button` is wrong.
2. `Add login button` is correct.

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

To resolve it, you (1) accept the current, (2) accept the incoming, or (3) both. Accepting both will concatenate the code for you to figure out later. Make the right decision by reading the code and asking your teammates why they made the edit.

## Destructive changes

These are *destructive* commands. Do you know what destructive means? It means you pull out a gun and shoot it in the head. These commands irreversibly delete work.

- `git clean -fd` 
Destroy all untracked files and directories from the working tree.
- `git push --force` 
Overwrite the remote repo's history with your local repo's history.

### Should I force push?

Git rejects the push if the local branch and the remote branch diverge in commit history. It causes `error: failed to push some refs to`.

1. **Parallel commits.** Your teammate pushed to the remote branch, and now your local branch is behind. To fix, `git pull`.
2. **Rewritten history.** You rebased or amended a commit that was already pushed. This rewrites your local commit history, diverging it from the remote branch.
   - *If you're on a team*, `git push --force-with-lease`. This force pushes but rejects if someone else pushed ahead of you.
   - *If you're solo*, `git push --force`. This is dangerous for teams. If someone else pushed ahead of you, it overwrites their push.

### Rebasing

Merge commits clutter the Git graph. You `git rebase <branch-name>` to keep it linear by replaying your commits onto the tip of the target branch. This changes the base commit your branch starts from. If you've already pushed the branch, you'll need to force push after rebasing. Don't rebase commits others are working on.

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
2. Add the file to `.gitignore`: `echo "<filename>" >> .gitignore`
3. Stop tracking the file: `git rm -r --cached <filename>`
4. Commit: `git commit -m "stop tracking <filename>"`
5. Clean the file out of history with [git-filter-repo](https://github.com/newren/git-filter-repo): `git filter-repo --invert-paths --path <filename>`
6. Force push. Teammates must re-clone after the force push: `git push --force`

## Can AI run Git commands?

Yes, but I don't allow AI to run destructive Git commands; I hand-type them myself to guards against blindly approving a series of Git operations when tired or time-pressured.