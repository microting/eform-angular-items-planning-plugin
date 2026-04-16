FROM node:22-bookworm-slim as node-env
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY eform-angular-frontend/eform-client ./
RUN yarn install
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0-noble AS build-env
WORKDIR /app
ARG GITVERSION
ARG PLUGINVERSION

# Copy csproj and restore as distinct layers
COPY eform-angular-frontend/eFormAPI/eFormAPI.Web ./eFormAPI.Web
COPY eform-angular-items-planning-plugin/eFormAPI/Plugins/ItemsPlanning.Pn ./ItemsPlanning.Pn
RUN dotnet publish eFormAPI.Web -o eFormAPI.Web/out /p:Version=$GITVERSION --runtime linux-x64 --configuration Release
RUN dotnet publish ItemsPlanning.Pn -o ItemsPlanning.Pn/out /p:Version=$PLUGINVERSION --runtime linux-x64 --configuration Release

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0-noble
WORKDIR /app
COPY --from=build-env /app/eFormAPI.Web/out .
RUN mkdir -p ./Plugins/ItemsPlanning.Pn
COPY --from=build-env /app/ItemsPlanning.Pn/out ./Plugins/ItemsPlanning.Pn
COPY --from=node-env /app/dist/browser wwwroot
RUN rm connection.json; exit 0

ENV DEBIAN_FRONTEND noninteractive
ENV Logging__Console__FormatterName=

RUN mkdir -p /usr/share/man/man1 && \
	apt-get update && \
	apt-get install -y -q --no-install-recommends \
		libxml2 \
		libgdiplus \
		libc6-dev \
		libreoffice-writer \
		libreoffice-core \
		fonts-liberation \
		fonts-dejavu-core \
		fonts-freefont-ttf \
		hyphen-en-us \
		openjdk-17-jre-headless && \
	apt-get -y -q remove libreoffice-gnome || true && \
	apt-get clean && \
	apt-get -y autoremove && \
	rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN adduser --home=/opt/libreoffice --disabled-password --gecos "" --shell=/bin/bash libreoffice

ENTRYPOINT ["dotnet", "eFormAPI.Web.dll"]
