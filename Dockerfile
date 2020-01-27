FROM buildpack-deps:jessie

# update the repository sources list
# and install dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc \
    && apt-get -y autoclean

RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN dpkg -i google-chrome-stable_current_amd64.deb; apt-get -fy install

RUN echo "int chown() { return 0; }" > preload.c && gcc -shared -o /libpreload.so preload.c && rm preload.c
ENV LD_PRELOAD=/libpreload.so

RUN mkdir -p /usr/src/app

COPY build/svg_to_png-linux /usr/bin/svg_to_png

WORKDIR /usr/src/app

VOLUME /usr/src/app

EXPOSE 3000

ENTRYPOINT ["svg_to_png", "--nocopy"]
