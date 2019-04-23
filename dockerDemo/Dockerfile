#FROM ubuntu:16.04
FROM ubuntu:latest

# Sneak the stf executable into $PATH.
#ENV PATH /app/bin:$PATH
ENV REPO="https://github.com/uds-se/stf.git"

# Work in app dir by default.
#WORKDIR /app

# Export default app port, not enough for all processes but it should do
# for now.
EXPOSE 3000
EXPOSE 8080
EXPOSE 7100

# Install app requirements. Trying to optimize push speed for dependant apps
# by reducing layers as much as possible. Note that one of the final steps
# installs development files for node-gyp so that npm install won't have to
# wait for them on the first native module installation.
RUN export DEBIAN_FRONTEND=noninteractive && \
    sed -i'' 's@http://archive.ubuntu.com/ubuntu/@mirror://mirrors.ubuntu.com/mirrors.txt@' /etc/apt/sources.list && \
    apt-get update -qq && \
    apt-get -qqy install wget python build-essential git && \
    cd /tmp && \
    wget --progress=dot:mega \
      https://nodejs.org/dist/v6.11.2/node-v6.11.2-linux-x64.tar.xz && \
    tar -xJf node-v*.tar.xz --strip-components 1 -C /usr/local && \
    rm node-v*.tar.xz

# Install rethinkdb
RUN wget -q -O foo.deb https://github.com/srh/rethinkdb/releases/download/v2.3.6.srh.1/rethinkdb_2.3.6.srh.1.0bionic_amd64.deb && \
    dpkg -i foo.deb || apt-get install -y -f && \
    rethinkdb --version

# Install Docker
RUN apt-get -qqy install apt-transport-https \
      ca-certificates \
      curl \
      gnupg2 \
      software-properties-common && \
    curl -fsSL https://download.docker.com/linux/$(. /etc/os-release; echo "$ID")/gpg > /tmp/dkey; apt-key add /tmp/dkey && \
    add-apt-repository \
      "deb [arch=amd64] https://download.docker.com/linux/$(. /etc/os-release; echo "$ID") \
      $(lsb_release -cs) \
      stable" && \
   apt-get update -qq && \
   apt-get -y install docker-ce

RUN /usr/local/lib/node_modules/npm/node_modules/node-gyp/bin/node-gyp.js install && \
    apt-get -qqy install libzmq3-dev libprotobuf-dev graphicsmagick yasm && \
    apt-get clean -qq && \
    rm -rf /var/cache/apt/* /var/lib/apt/lists/*

# Clone app source
RUN git clone ${REPO} stf && \
    cd stf && \
    git fetch && \
    git checkout OSTF-DEMO && \
    git pull

WORKDIR stf
RUN npm install -g stf && \
    npm install && \
    npm link && \
    npm prune --production && \
    npm cache clean
RUN rm -rf ~/.node-gyp

RUN chmod +x ./dockerDemo/start.sh
RUN chmod +x ./dockerDemo/startFarm.sh

ENTRYPOINT ["./dockerDemo/startFarm.sh"]
