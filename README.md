<img width="1675" alt="NVR Screen Shot 2022-10-12" src="https://user-images.githubusercontent.com/12535192/195400830-ea987633-c365-4077-bfcf-2d0b46d11a8a.png">


# Durant's Notes

This personal project started out as a vite-mui project on [stackblitz](https://stackblitz.com/). If you haven't seen vite or stackblitz, they're pretty cool (at least in Fall 2022). One thing about vite that I just found out is that Jest (testing) support is not great. There is a vite-jest npm package (which is in thie repo, but I need to force install from npm). I will probably explore vitest with React Testing Library soon.

Latest feature added: ability to select poet and poem from data fetched from a poetry database.

If you want to see this repo run, clone it and then run

```sh
npm install
npm run dev
```

Or you can use [gitpod](https://www.gitpod.io/) which I only just disovered recently and it's also really cool.

# ToDo

The purspose of this personal project is to mostly stay in practice by adding a new feature regularly (daily or almost-daily). 

I think I'm finally at the stage where I should add state-management like redux or Xstate (I want to check out Xstate), given the crazy debugging I had to do in the refactor to chase down where variables were bound (think closures set up while binding handler events which then update state, fun!).
# How this was repo was created and how to create a new one

Brilliantly easy:

1. Go here https://github.com/mui/material-ui/tree/master/examples/vitejs
2. Click the Open in Stackblitz button
3. Click the Fork button at the top


