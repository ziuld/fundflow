# ─────────────────────────────────────────────
# STAGE 1 — BUILD
# Uses a full JDK image to compile and package
# the application into a JAR file.
# This stage is discarded after the build —
# it never ends up in the final image.
# ─────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /app

# Copy Maven wrapper and pom.xml first.
# Docker caches layers — if pom.xml hasn't changed,
# it won't re-download dependencies on every build.
# This is a critical optimization for CI/CD speed.
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies (cached layer)
RUN ./mvnw dependency:go-offline -B

# Now copy source code and build
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# ─────────────────────────────────────────────
# STAGE 2 — RUNTIME
# Uses a minimal JRE image (no compiler, no tools).
# Smaller image = faster deploys, smaller attack surface.
# eclipse-temurin:21-jre-alpine is ~180MB vs ~450MB for JDK.
# ─────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /app

# Create a non-root user — security best practice.
# Never run application processes as root in a container.
RUN addgroup -S fundflow && adduser -S fundflow -G fundflow

# Copy only the JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Give ownership to the non-root user
RUN chown fundflow:fundflow app.jar
USER fundflow

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]