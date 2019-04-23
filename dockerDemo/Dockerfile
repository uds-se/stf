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
    apt-get update && \
    apt-get -y install wget python build-essential git-all git && \
    cd /tmp && \
    wget --progress=dot:mega \
      https://nodejs.org/dist/v6.11.2/node-v6.11.2-linux-x64.tar.xz && \
    tar -xJf node-v*.tar.xz --strip-components 1 -C /usr/local && \
    rm node-v*.tar.xz

# Install rethinkdb
RUN wget -O foo.deb https://github.com/srh/rethinkdb/releases/download/v2.3.6.srh.1/rethinkdb_2.3.6.srh.1.0bionic_amd64.deb
RUN dpkg -i foo.deb || apt-get install -y -f
RUN rethinkdb --version

RUN /usr/local/lib/node_modules/npm/node_modules/node-gyp/bin/node-gyp.js install && \
    apt-get -y install libzmq3-dev libprotobuf-dev graphicsmagick yasm && \
    apt-get clean && \
    rm -rf /var/cache/apt/* /var/lib/apt/lists/*

# Copy app source.
#COPY . /tmp/build/
RUN git clone ${REPO} stf && \
    cd stf && \
    git fetch && \
    git checkout OSTF-DEMO

# Give permissions to our build user.
#RUN mkdir -p /app && \
#    chown -R stf-build:stf-build /tmp/build /app

# Run the build.
#RUN set -x && \
#    cd /tmp/build && \
#    export PATH=$PWD/node_modules/.bin:$PATH && \
#    npm install --loglevel http && \
#    npm pack && \
#    tar xzf stf-*.tgz --strip-components 1 -C /app && \
#    bower cache clean && \
#    npm prune --production && \
#    mv node_modules /app && \
#    npm cache clean && \
#    rm -rf ~/.node-gyp && \
#    cd /app && \
#    rm -rf /tmp/*

WORKDIR stf
RUN npm link && \
    npm prune --production && \
    npm cache clean
RUN rm -rf ~/.node-gyp

RUN chmod +x ./dockerDemo/start.sh
RUN chmod +x ./dockerDemo/startFarm.sh

ENTRYPOINT ["./dockerDemo/startFarm.sh"]
