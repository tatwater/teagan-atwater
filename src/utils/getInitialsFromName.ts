
export default function getInitialsFromName(fullName: string) {
  const allNames = fullName.trim().split(' ');

  const initials = allNames.reduce((accumulator, current, index) => {
    if (index === 0 || index === allNames.length - 1) {
      accumulator = `${ accumulator }${ current.charAt(0).toUpperCase() }`;
    }

    return accumulator;
  }, '');


  return initials;
}
