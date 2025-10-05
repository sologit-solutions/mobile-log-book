# Logbook alternative for sailors and boaters

It is recommended to use [Docker](https://www.docker.com/) to run this project.

##### For Windows users:

It is recommended to run the project using the bash emulator provided by [Git for Windows](https://gitforwindows.org/) instead of WSL for watchmode compatability.

#### Setting up the development environment

##### 1. Clone this repository

```
git clone https://github.com/sologit-solutions/mobile-log-book.git
```

##### 2. Load environment variables

```
source main.env
```

##### 3. Build the project

```
docker compose up -w 
```