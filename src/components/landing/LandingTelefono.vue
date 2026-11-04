<template>
    <div class="flex justify-center py-5" aria-hidden="true">
        <div class="relative w-40 -rotate-6 rounded-[2rem] border-[5px] border-foreground bg-surface p-1 shadow-lg sm:w-44 lg:w-48">
            <div class="relative flex aspect-[9/18] items-center justify-center overflow-hidden rounded-[1.5rem] bg-background">
                <div class="absolute top-2 left-1/2 h-4 w-16 -translate-x-1/2 rounded-full bg-foreground"></div>
                <div class="absolute -right-20 -bottom-20 size-64 rounded-[45%] bg-icon/15"></div>
                <div class="absolute -right-12 -bottom-28 size-64 rounded-[45%] bg-icon/20"></div>
                <span class="relative block size-20 bg-primary [mask-image:url('/logo.webp')] [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center]"></span>
                <div class="absolute bottom-2 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-foreground/30"></div>
            </div>
        </div>
    </div>
</template>
