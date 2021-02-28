const ratios = {
  octave: 2,
  majorSeventh: (15 / 8),
  minorSeventh: (16 / 9),
  majorSixth: (5 / 3),
  minorSixth: (8 / 5),
  fifth: (3 / 2),
  augmentedFourth: (45 / 32),
  fourth: (4 / 3),
  majorThird: (5 / 4),
  minorThird: (6 / 5),
  majorSecond: (9 / 8),
  minorSecond: (16 / 15),
  cinema: 2.39,
  golden: 1.618
}

const sequences = {
  double: (x: number, i: number) => x * Math.pow(2, i),
  triple: (x: number, i: number) => x * Math.pow(3, i),
  quadruple: (x: number, i: number) => x * Math.pow(4, i),
  quintuple: (x: number, i: number) => x * Math.pow(5, i),
  exponential: (x: number, i: number) => Math.pow(x, (i + 1)),
  fibonacci: (x: number, i: number) => {
    let a = 1
    let b = 0

    while (i >= 0) {
      const temp = a
      a = a + b
      b = temp
      i--
    }

    return x * b
  }
}

export default class ScaleSequence {
  private start: number
  private maxLevel: number
  private remaining: number
  private sequence: SequenceFunction

  level: number
  ratio: number
  scale: number

  init (start: number, ratio: string, sequence: string, maxLevel = 5): void {
    this.ratio = ratios[ratio]
    this.sequence = sequences[sequence]
    this.start = start

    this.scale = 1
    this.level = 0
    this.maxLevel = maxLevel
    this.remaining = this.sequence(this.start, this.level)
  }

  next (): void {
    this.remaining--
    if (this.remaining === 0) { this.shift() }
  }

  shift (): void {
    if (this.level <= this.maxLevel) {
      this.level++
      this.scale /= this.ratio
    }

    this.remaining = this.sequence(this.start, this.level)
  }
}

type SequenceFunction = (x: number, i: number) => number
