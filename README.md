# Letter-box Solver
This is a solver for the NY Times Game "Letter Boxed"

The game is played by connecting letters to create words. Letters can only be connected to adjacent letters they do not share a side with. For example, given this set up:

      W M T
    S       I
    B       H
    C       O
      A E Y
`CASH` is a valid letter sequence. As a counter example, `HOME` ia not valid because `H` and `O` share a side and cannot be next to eachother in the letter sequence. 

The Goal is to use all the letters in as few words as possible.

To Run:
`npm i`
`npm run solve`
