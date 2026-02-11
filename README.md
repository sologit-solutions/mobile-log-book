# Logbook alternative for sailors and boaters

[Docker](https://www.docker.com/) is required to run this project.

#### Setting up the development environment

##### 1. Clone this repository

```
git clone https://github.com/sologit-solutions/mobile-log-book.git
```

##### 2. Make local copies of .env files

To prevent unwanted commits overriding defaults copy the .env files with your name or whatever as a prefix.
Note that this step will require manually modifying the line "export ENV_FILE=dev.env" in example.load.env 
to match the new name. 

```
cp dev.env example.dev.env
```

```
cp load.env example.load.env
```

##### 3. Load environment variables and helper commands

Load environment variables and helper commands into your current shell environment.

```
source example.load.env
```

##### 4. Run setup script to install dependencies

This step installs project dependencies to prevent your IDE/Text editor from complaining.
It is not required to run the project with docker as the containers perform a clean install.

```
run-setup
```

##### 5. Create the development database

This command runs prisma migrations on the dev container to create the local
database. It iss also used to create new migrations after editing the prisma
schemas.

```
migrate-dev
```

##### 6. Build and run the development environment

This command builds and runs the containers using the development configuration.

```
run-dev
```

The development environment has hot-reloading enabled to make development easier
without having to restart the container.

#### Other commands:

Stop and remove development containers

```
dev-down
```

Chain with -v flag to destroy everything including the database 

```
dev-down -v
```

Run production configuration

```
run-prod
```