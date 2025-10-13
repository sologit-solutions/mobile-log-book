# Logbook alternative for sailors and boaters

[Docker](https://www.docker.com/) is required to run this project.

#### Setting up the development environment

##### 1. Clone this repository

```
git clone https://github.com/sologit-solutions/mobile-log-book.git
```
##### 2. Run setup script to install dependencies

This step installs project dependencies to prevent your IDE/Text editor from complaining.
It is not required to run the project with docker as the containers perform a clean install.

```
npm run setup
```

##### 3. Make local copies of .env files

To prevent unwanted commits overriding defaults copy the .env files with your name or whatever as a prefix.
Note that this step will require manually modifying the line "export ENV_FILE=dev.env" in example.load.env 
to match the new name. 

```
cp dev.env example.dev.env
```

```
cp load.env example.load.env
```

##### 3. Load environment variables

Load environment variables into your current shell.

```
source example.load.env
```

##### 4. Build and run the development environment

```
run-dev
```
