/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
type Content = {
  heading: string;
  body: {
    text: string;
  }[];
};

export function calculateReadingTime(contents: Content[]): number {
  const totalWords = contents.reduce((total, contentItem) => {
    total += contentItem.heading.split(' ').length;

    const words = contentItem.body.map(item => item.text.split(' ').length);
    words.map(word => (total += word));
    return total;
  }, 0);
  const readTime = Math.ceil(totalWords / 200);

  return readTime;
}
