const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const NUMBERS = '0123456789'
const SYMBOLS = '!@#$%^&*()-_=+[]{}:,.?'

const ALL_CHARACTERS = LOWERCASE + UPPERCASE + NUMBERS + SYMBOLS

function getSecureRandomInt(maxExclusive: number): number {
  if (maxExclusive <= 0) return 0

  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const randomBuffer = new Uint32Array(1)
    const maxUint32 = 0xffffffff
    const limit = maxUint32 - (maxUint32 % maxExclusive)

    let randomValue = 0
    do {
      window.crypto.getRandomValues(randomBuffer)
      randomValue = randomBuffer[0]
    } while (randomValue >= limit)

    return randomValue % maxExclusive
  }

  return Math.floor(Math.random() * maxExclusive)
}

function pickRandom(source: string): string {
  return source[getSecureRandomInt(source.length)]
}

function shuffleString(value: string): string {
  const characters = value.split('')

  for (let index = characters.length - 1; index > 0; index--) {
    const randomIndex = getSecureRandomInt(index + 1)
    ;[characters[index], characters[randomIndex]] = [characters[randomIndex], characters[index]]
  }

  return characters.join('')
}

export function generatePostgreSQLPassword(length = 20): string {
  const safeLength = Math.max(12, length)

  const requiredCharacters = [pickRandom(LOWERCASE), pickRandom(UPPERCASE), pickRandom(NUMBERS), pickRandom(SYMBOLS)]

  const remainingLength = safeLength - requiredCharacters.length
  let password = requiredCharacters.join('')

  for (let index = 0; index < remainingLength; index++) {
    password += pickRandom(ALL_CHARACTERS)
  }

  return shuffleString(password)
}
