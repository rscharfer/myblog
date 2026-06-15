---
title: git-worktree in my own words
published: June 15, 2026
subtitle: why are work trees so awesome?
---


## Issue it solves

It allows you to check out a branch without having to stash or commit the changes on the branch you are currently on i.e. it allows you to work on different branches simultaneously

## Use case

Check out a co-worker's branch to see their changes without having to stash or commit the changes on your branch

## How to use it 

This is a way to add a work tree with the branch "hot-fix" checked out within it: `git worktree add ../worktrees/hot-fix`

Let's dissect that command a bit. 

* You are actually creating a new directory when you create a work tree. 
* The directory will be located at the path defined in the argument passed to `git worktree add` i.e. `../worktrees/hot-fix`.
* Inside that directory will be the same code i.e. all the project files of the repo. (Git calls this new directory and the files inside of it the new work tree.)
* The last part of the argument passed to `git worktree add` i.e. `hot-fix` will be the name of the branch that is checked out for you within that directory/work tree.
* If you want to check out a branch that already exists, just make sure the last part of that path i.e. the part after the last forward slash is the name of the branch.
* If the branch does not already exist, a new branch by that name will be created.
* _Navigating_ to that directory is how you work on the branch that is checked out there i.e. use the _cd_ command or open the new directory/work tree in a different instance of your IDE.
* You cannot check out a branch in the new directory if it is already checked out in the main work tree i.e. you cannot work on the same branch in two work trees/directories.
* When you use the `git worktree add` command, you are creating the path to the new directory as well as the name of the branch you want to check out.
* There is a good place to put the worktree. Although you can put the new directory/work tree inside the main repo, doing so would make it look like you want to add a directory to the repo, and you don't. Place the directory/work tree somewhere outside the repo.

## What takes getting used to
You are creating a new directory (actually "work tree") AND checking out a branch (in that directory) when you use the `git worktree add` command.

