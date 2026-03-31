<template>
  <div class="relative mt-8 flex lg:mt-0 lg:pb-4 lg:pl-20 lg:pt-1.5">
    <i class="flex h-8 w-8 place-items-center place-content-center text-slate-700 lg:absolute lg:-left-6 lg:top-[calc(50%-25px)] lg:h-12 lg:w-12 lg:rounded-lg lg:border lg:border-slate-200 lg:bg-white">
      <slot name="icon"></slot>
    </i>
    <div class="ml-4 flex-1 lg:ml-0">
      <h3 class="mb-1.5 text-xl font-medium text-slate-800">
        <slot name="heading"></slot>
      </h3>
      <slot></slot>
    </div>
  </div>
</template>
