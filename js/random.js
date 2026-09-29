export class PinkNoise {
    /* Function to generate pink noise based on the New Shade of Pink algorithm and Kellet filters */
    constructor() {
        this.b0 = 0;
        this.b1 = 0;
        this.b2 = 0;
        this.b3 = 0;
        this.b4 = 0;
        this.b5 = 0;
        this.b6 = 0;
    }

    next() {
        // White noise: RNG [-1.0, 1.0]
        const white = (Math.random() * 2)-1

        // IIR Filters (1/f curve approximation)
        this.b0 = 0.99886 * this.b0 + white * 0.0555179;
        this.b1 = 0.99332 * this.b1 + white * 0.0750759;
        this.b2 = 0.96900 * this.b2 + white * 0.1538520;
        this.b3 = 0.86650 * this.b3 + white * 0.3104856;
        this.b4 = 0.55000 * this.b4 + white * 0.5329522;
        this.b5 = -0.7616 * this.b5 - white * 0.0168980;

        // Sum
        const pink = this.b0 + this.b1 + this.b2 + this.b3 + this.b4 + this.b5 + this.b6 + white * 0.5362;

        // Feed-forward
        this.b6 = white * 0.115926;

        // Normalization
        return pink*0.11;
    }
}