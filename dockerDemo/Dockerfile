#FROM ubuntu:16.04
FROM ubuntu:latest

# Sneak the stf executable into $PATH.
#ENV PATH /app/bin:$PATH
ENV REPO="https://github.com/uds-se/stf.git"

# Export default app port
EXPOSE 3000
EXPOSE 8080
EXPOSE 7100

# Install app requirements
RUN export DEBIAN_FRONTEND=noninteractive && \
    sed -i'' 's@http://archive.ubuntu.com/ubuntu/@mirror://mirrors.ubuntu.com/mirrors.txt@' /etc/apt/sources.list && \
    apt-get update -qq && \
    apt-get -qqy install wget python build-essential git gnupg2 curl && \
    curl -sL https://deb.nodesource.com/setup_8.x | bash && \
    apt-get install nodejs -qqy && \
    node -v && \
    npm --version

# Install rethinkdb
RUN wget -q -O foo.deb https://github.com/srh/rethinkdb/releases/download/v2.3.6.srh.1/rethinkdb_2.3.6.srh.1.0bionic_amd64.deb && \
    dpkg -i foo.deb || apt-get install -qqy -f && \
    rethinkdb --version

# Install Docker
RUN apt-get -qqy install apt-transport-https ca-certificates software-properties-common && \
    curl -fsSL https://download.docker.com/linux/$(. /etc/os-release; echo "$ID")/gpg > /tmp/dkey; apt-key add /tmp/dkey && \
    add-apt-repository \
      "deb [arch=amd64] https://download.docker.com/linux/$(. /etc/os-release; echo "$ID") \
      $(lsb_release -cs) \
      stable" && \
    apt-get update -qq && \
    apt-get -qqy install docker-ce && \
    docker --version

RUN apt-get -qqy install libzmq3-dev libprotobuf-dev graphicsmagick yasm && \
    apt-get clean -qq && \
    rm -rf /var/cache/apt/* /var/lib/apt/lists/*

# Clone app source
RUN git clone ${REPO} stf && \
    cd stf && \
    git fetch && \
    git checkout OSTF-DEMO

WORKDIR stf
# We are running as root. Create this file, othwerwise bower would complain
RUN echo '{ "allow_root": true }' > /root/.bowerrc && \
    npm install --unsafe --quiet --save-dev --unsafe-perm=true -g stf && \
    npm install --unsafe --quiet --save-dev --unsafe-perm=true && \
    npm link && \
    rm -rf ~/.node-gyp


#RUN npm install --unsafe --quiet -g stf && \
#    npm install --unsafe --quiet && \
#    npm link && \
#    npm prune --production && \
#    npm cache clean && \
#    rm -rf ~/.node-gyp

# Push local scripts
ADD start.sh /stf/dockerDemo/start.sh
ADD startFarm.sh /stf/dockerDemo/startFarm.sh

ENTRYPOINT ["./dockerDemo/startFarm.sh"]
