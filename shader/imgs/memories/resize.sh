for FILE in *.jpg
do
    FILENAME=`echo ${FILE} | sed 's/\.[^\.]*$//'`
    ffmpeg -i ${FILENAME}.jpg -vf scale=-1:1080 ${FILENAME}.jpg
done